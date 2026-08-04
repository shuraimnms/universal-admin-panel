import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import FormData from 'form-data';
import { decrypt } from '../lib/crossref/crypto';

const prisma = new PrismaClient();

async function processDeposit(deposit: any) {
  try {
    console.log(`Processing deposit: ${deposit.id}`);
    
    const settings = await prisma.crossrefSettings.findFirst();
    if (!settings) throw new Error('Crossref settings not found');

    const xmlRecord = await prisma.crossrefXmlVersion.findUnique({
      where: { id: deposit.xmlVersionId }
    });
    if (!xmlRecord) throw new Error(`XML record not found for deposit: ${deposit.id}`);

    // Real API call to Crossref
    const endpoint = settings.environment === 'PRODUCTION' 
      ? 'https://doi.crossref.org/servlet/deposit'
      : 'https://test.crossref.org/servlet/deposit';
      
    const password = decrypt(settings.crossrefPass);
    if (!password || password === '********') {
      throw new Error('Valid Crossref password not found');
    }

    const form = new FormData();
    form.append('operation', 'doMDUpload');
    form.append('login_id', settings.crossrefUser);
    form.append('login_passwd', password);
    form.append('fname', Buffer.from(xmlRecord.xmlData, 'utf-8'), {
      filename: `${deposit.doi.replace('/', '_')}.xml`,
      contentType: 'application/xml',
    });

    const response = await axios.post(endpoint, form, {
      headers: form.getHeaders(),
    });

    // Crossref returns HTTP 200 even for schema validation failures. The response body contains the log.
    const responseBody = response.data.toString();
    const isSuccess = responseBody.includes('Record not processed') === false && response.status === 200;
    
    // Update status based on response
    await prisma.crossrefDeposit.update({
      where: { id: deposit.id },
      data: {
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        crossrefResponse: responseBody,
        logs: {
          create: {
            details: `Crossref API Response: ${responseBody.substring(0, 500)}...`,
            action: 'DEPOSIT',
            status: isSuccess ? 'SUCCESS' : 'FAILED'
          }
        },
        updatedAt: new Date(),
      }
    });
    
    console.log(`Successfully processed deposit: ${deposit.id} (Success: ${isSuccess})`);
  } catch (error: any) {
    console.error(`Failed to process deposit: ${deposit.id}`, error.message);
    
    const newRetryCount = deposit.retryCount + 1;
    const newStatus = newRetryCount >= 3 ? 'FAILED' : 'WAITING';

    await prisma.crossrefDeposit.update({
      where: { id: deposit.id },
      data: {
        status: newStatus,
        retryCount: newRetryCount,
        logs: {
          create: {
            details: error.message || 'Unknown error occurred during deposit.',
            action: 'DEPOSIT',
            status: 'FAILED'
          }
        },
        updatedAt: new Date(),
      }
    });
  }
}

async function pollQueue() {
  console.log('Polling queue for pending deposits...');
  const pendingDeposits = await prisma.crossrefDeposit.findMany({
    where: {
      status: 'WAITING',
      retryCount: {
        lt: 3
      }
    },
    take: 10, // process in batches
  });

  if (pendingDeposits.length === 0) {
    console.log('No pending deposits found.');
    return;
  }

  console.log(`Found ${pendingDeposits.length} pending deposits. Processing...`);

  // Update status to PROCESSING to prevent concurrent workers from picking them up
  const ids = pendingDeposits.map(d => d.id);
  await prisma.crossrefDeposit.updateMany({
    where: { id: { in: ids } },
    data: { status: 'PROCESSING', updatedAt: new Date() }
  });

  for (const deposit of pendingDeposits) {
    await processDeposit(deposit);
  }
}

async function runWorker() {
  console.log('Starting Crossref Worker daemon...');
  
  // Polling loop
  while (true) {
    await pollQueue();
    // Wait 5 seconds before polling again
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

runWorker()
  .catch(e => {
    console.error('Worker failed:', e);
    process.exit(1);
  });
