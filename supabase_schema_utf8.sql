-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "institution" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ban_reason" TEXT,
    "is_banned" BOOLEAN NOT NULL DEFAULT false,
    "is_warned" BOOLEAN NOT NULL DEFAULT false,
    "warning_date" TIMESTAMP(3),
    "warning_message" TEXT,
    "bio" TEXT,
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "volume" TEXT NOT NULL,
    "issue_number" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "publish_date" TIMESTAMP(3) NOT NULL,
    "cover_image" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "site_id" TEXT,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "papers" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "keywords" TEXT,
    "file_path" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "category" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),
    "submitter_id" TEXT NOT NULL,
    "cover_image" TEXT,
    "issue_number" TEXT,
    "publication_date" TIMESTAMP(3),
    "unique_number" TEXT,
    "volume_number" TEXT,
    "issue_id" TEXT,
    "doi" TEXT,
    "doi_status" TEXT DEFAULT 'PENDING',
    "doi_registered_at" TIMESTAMP(3),
    "crossref_metadata" TEXT,
    "scribd_url" TEXT,
    "site_id" TEXT,

    CONSTRAINT "papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "comments" TEXT,
    "score" INTEGER,
    "recommendation" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "deadline" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_assignments" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "assigned_by_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "review_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paper_authors" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "author_order" INTEGER NOT NULL,
    "is_corresponding" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "paper_authors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "user_id" TEXT,
    "downloaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "paper_contents" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "introduction" TEXT,
    "literature_review" TEXT,
    "methodology" TEXT,
    "results" TEXT,
    "discussion" TEXT,
    "conclusion" TEXT,
    "references" TEXT,
    "images" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paper_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conferences" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "venue" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "video_url" TEXT,
    "site_id" TEXT,

    CONSTRAINT "conferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plagiarism_checks" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "checkResult" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "sources" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checked_by" TEXT,

    CONSTRAINT "plagiarism_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "media_url" TEXT,
    "media_type" TEXT,
    "link_url" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "position" TEXT NOT NULL DEFAULT 'HOMEPAGE',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "target_audience" TEXT NOT NULL DEFAULT 'ALL',
    "site_id" TEXT,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "country" TEXT,
    "country_code" TEXT,
    "city" TEXT,
    "region" TEXT,
    "user_agent" TEXT,
    "referer" TEXT,
    "page" TEXT NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT,
    "user_id" TEXT,
    "certificate_number" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PUBLICATION',
    "title" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "institution" TEXT,
    "topic" TEXT,
    "prize" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "custom_date" TIMESTAMP(3),
    "pdf_path" TEXT,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "revoked_at" TIMESTAMP(3),
    "revoked_by" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_configs" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "twitter_title" TEXT,
    "twitter_description" TEXT,
    "twitter_image" TEXT,
    "canonical_url" TEXT,
    "robots" TEXT DEFAULT 'index, follow',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_settings" (
    "id" TEXT NOT NULL,
    "is_maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_code" TEXT,
    "maintenance_message" TEXT,
    "maintenance_start_time" TIMESTAMP(3),
    "maintenance_end_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "require_email_verification" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "maintenance_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "citations" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "style" TEXT NOT NULL DEFAULT 'APA',
    "content" TEXT NOT NULL,
    "doi" TEXT,
    "url" TEXT,
    "access_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "citations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "editorial_board_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "institution" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "expertise" TEXT,
    "image_url" TEXT,
    "position" TEXT NOT NULL DEFAULT 'MEMBER',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resume_url" TEXT,

    CONSTRAINT "editorial_board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisory_board_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "institution" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "expertise" TEXT,
    "image_url" TEXT,
    "position" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resume_url" TEXT,

    CONSTRAINT "advisory_board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviewer_board_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "institution" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "expertise" TEXT,
    "image_url" TEXT,
    "position" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resume_url" TEXT,

    CONSTRAINT "reviewer_board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_guidelines" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_guidelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peer_review_processes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "step" INTEGER NOT NULL DEFAULT 1,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peer_review_processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archives" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "volume" TEXT,
    "issue" TEXT,
    "year" INTEGER NOT NULL,
    "cover_image" TEXT,
    "pdf_path" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "archives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archive_papers" (
    "id" TEXT NOT NULL,
    "archive_id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "page_start" INTEGER,
    "page_end" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archive_papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chief_patrons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "image_url" TEXT,
    "bio" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chief_patrons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployment_config" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 21,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "remote_path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deployment_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deployment_log" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deployment_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_replies" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ebooks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT,
    "file_path" TEXT NOT NULL,
    "cover_image" TEXT,
    "access_type" TEXT NOT NULL DEFAULT 'PUBLIC',
    "trial_pages" INTEGER NOT NULL DEFAULT 5,
    "total_pages" INTEGER,
    "price" DOUBLE PRECISION,
    "category" TEXT,
    "tags" TEXT,
    "isbn" TEXT,
    "scribd_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "site_id" TEXT,

    CONSTRAINT "ebooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ebook_purchases" (
    "id" TEXT NOT NULL,
    "ebook_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_id" TEXT,
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "ebook_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ebook_views" (
    "id" TEXT NOT NULL,
    "ebook_id" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT,
    "page_viewed" INTEGER NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_id" TEXT,

    CONSTRAINT "ebook_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impact_factors" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "certificate_path" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "site_id" TEXT,

    CONSTRAINT "impact_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animation_settings" (
    "id" TEXT NOT NULL,
    "animation_type" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "custom_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "institution" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "expertise" TEXT,
    "image_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "abbreviation" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_site_access" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_site_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "affiliation" TEXT,
    "pubType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetJournal" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crossref_settings" (
    "id" TEXT NOT NULL,
    "publisher_name" TEXT NOT NULL,
    "publisher_email" TEXT NOT NULL,
    "doi_prefix" TEXT NOT NULL,
    "crossref_user" TEXT NOT NULL,
    "crossref_pass" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'production',
    "depositor_name" TEXT NOT NULL,
    "depositor_email" TEXT NOT NULL,
    "auto_deposit" BOOLEAN NOT NULL DEFAULT false,
    "auto_generate_doi" BOOLEAN NOT NULL DEFAULT false,
    "retry_failed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crossref_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crossref_journal_settings" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "journal_name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "issn" TEXT,
    "eissn" TEXT,
    "publisher" TEXT NOT NULL,
    "crossref_prefix" TEXT NOT NULL,
    "license" TEXT,
    "language" TEXT,
    "country" TEXT,
    "homepage" TEXT,
    "oai_endpoint" TEXT,
    "publication_frequency" TEXT,
    "copyright" TEXT,
    "open_access" BOOLEAN NOT NULL DEFAULT true,
    "peer_review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crossref_journal_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crossref_deposits" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "doi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "queue_id" TEXT,
    "xml_version_id" TEXT,
    "crossref_response" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "operator_id" TEXT,
    "submission_time" TIMESTAMP(3),
    "completion_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crossref_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crossref_logs" (
    "id" TEXT NOT NULL,
    "deposit_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL,
    "operator_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crossref_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crossref_xml_versions" (
    "id" TEXT NOT NULL,
    "paper_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "xml_data" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crossref_xml_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "issues_site_id_idx" ON "issues"("site_id");

-- CreateIndex
CREATE INDEX "issues_year_idx" ON "issues"("year");

-- CreateIndex
CREATE INDEX "issues_publish_date_idx" ON "issues"("publish_date");

-- CreateIndex
CREATE INDEX "issues_is_published_idx" ON "issues"("is_published");

-- CreateIndex
CREATE UNIQUE INDEX "issues_volume_issue_number_key" ON "issues"("volume", "issue_number");

-- CreateIndex
CREATE INDEX "papers_site_id_idx" ON "papers"("site_id");

-- CreateIndex
CREATE INDEX "papers_submitter_id_idx" ON "papers"("submitter_id");

-- CreateIndex
CREATE INDEX "papers_status_idx" ON "papers"("status");

-- CreateIndex
CREATE INDEX "papers_category_idx" ON "papers"("category");

-- CreateIndex
CREATE INDEX "papers_published_at_idx" ON "papers"("published_at");

-- CreateIndex
CREATE INDEX "papers_issue_id_idx" ON "papers"("issue_id");

-- CreateIndex
CREATE INDEX "papers_volume_number_idx" ON "papers"("volume_number");

-- CreateIndex
CREATE INDEX "papers_issue_number_idx" ON "papers"("issue_number");

-- CreateIndex
CREATE INDEX "papers_publication_date_idx" ON "papers"("publication_date");

-- CreateIndex
CREATE INDEX "papers_unique_number_idx" ON "papers"("unique_number");

-- CreateIndex
CREATE INDEX "papers_doi_idx" ON "papers"("doi");

-- CreateIndex
CREATE INDEX "papers_doi_status_idx" ON "papers"("doi_status");

-- CreateIndex
CREATE INDEX "reviews_paper_id_idx" ON "reviews"("paper_id");

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "reviews_deadline_idx" ON "reviews"("deadline");

-- CreateIndex
CREATE INDEX "review_assignments_paper_id_idx" ON "review_assignments"("paper_id");

-- CreateIndex
CREATE INDEX "review_assignments_reviewer_id_idx" ON "review_assignments"("reviewer_id");

-- CreateIndex
CREATE INDEX "review_assignments_assigned_by_id_idx" ON "review_assignments"("assigned_by_id");

-- CreateIndex
CREATE INDEX "review_assignments_due_date_idx" ON "review_assignments"("due_date");

-- CreateIndex
CREATE UNIQUE INDEX "review_assignments_paper_id_reviewer_id_key" ON "review_assignments"("paper_id", "reviewer_id");

-- CreateIndex
CREATE INDEX "paper_authors_paper_id_idx" ON "paper_authors"("paper_id");

-- CreateIndex
CREATE INDEX "paper_authors_user_id_idx" ON "paper_authors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "paper_authors_paper_id_author_order_key" ON "paper_authors"("paper_id", "author_order");

-- CreateIndex
CREATE INDEX "downloads_paper_id_idx" ON "downloads"("paper_id");

-- CreateIndex
CREATE INDEX "downloads_user_id_idx" ON "downloads"("user_id");

-- CreateIndex
CREATE INDEX "downloads_downloaded_at_idx" ON "downloads"("downloaded_at");

-- CreateIndex
CREATE INDEX "bookmarks_paper_id_idx" ON "bookmarks"("paper_id");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_paper_id_user_id_key" ON "bookmarks"("paper_id", "user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "paper_contents_paper_id_key" ON "paper_contents"("paper_id");

-- CreateIndex
CREATE INDEX "paper_contents_paper_id_idx" ON "paper_contents"("paper_id");

-- CreateIndex
CREATE INDEX "conferences_site_id_idx" ON "conferences"("site_id");

-- CreateIndex
CREATE INDEX "conferences_start_date_idx" ON "conferences"("start_date");

-- CreateIndex
CREATE INDEX "conferences_end_date_idx" ON "conferences"("end_date");

-- CreateIndex
CREATE INDEX "conferences_status_idx" ON "conferences"("status");

-- CreateIndex
CREATE INDEX "conferences_is_public_idx" ON "conferences"("is_public");

-- CreateIndex
CREATE INDEX "conferences_created_by_idx" ON "conferences"("created_by");

-- CreateIndex
CREATE INDEX "plagiarism_checks_paper_id_idx" ON "plagiarism_checks"("paper_id");

-- CreateIndex
CREATE INDEX "plagiarism_checks_status_idx" ON "plagiarism_checks"("status");

-- CreateIndex
CREATE INDEX "plagiarism_checks_checked_by_idx" ON "plagiarism_checks"("checked_by");

-- CreateIndex
CREATE INDEX "advertisements_is_enabled_idx" ON "advertisements"("is_enabled");

-- CreateIndex
CREATE INDEX "advertisements_position_idx" ON "advertisements"("position");

-- CreateIndex
CREATE INDEX "advertisements_priority_idx" ON "advertisements"("priority");

-- CreateIndex
CREATE INDEX "advertisements_start_date_idx" ON "advertisements"("start_date");

-- CreateIndex
CREATE INDEX "advertisements_end_date_idx" ON "advertisements"("end_date");

-- CreateIndex
CREATE INDEX "advertisements_created_by_idx" ON "advertisements"("created_by");

-- CreateIndex
CREATE INDEX "announcements_site_id_idx" ON "announcements"("site_id");

-- CreateIndex
CREATE INDEX "announcements_is_published_idx" ON "announcements"("is_published");

-- CreateIndex
CREATE INDEX "announcements_type_idx" ON "announcements"("type");

-- CreateIndex
CREATE INDEX "announcements_priority_idx" ON "announcements"("priority");

-- CreateIndex
CREATE INDEX "announcements_target_audience_idx" ON "announcements"("target_audience");

-- CreateIndex
CREATE INDEX "announcements_published_at_idx" ON "announcements"("published_at");

-- CreateIndex
CREATE INDEX "announcements_expires_at_idx" ON "announcements"("expires_at");

-- CreateIndex
CREATE INDEX "announcements_created_by_idx" ON "announcements"("created_by");

-- CreateIndex
CREATE INDEX "visitors_country_idx" ON "visitors"("country");

-- CreateIndex
CREATE INDEX "visitors_country_code_idx" ON "visitors"("country_code");

-- CreateIndex
CREATE INDEX "visitors_visited_at_idx" ON "visitors"("visited_at");

-- CreateIndex
CREATE INDEX "visitors_page_idx" ON "visitors"("page");

-- CreateIndex
CREATE INDEX "visitors_session_id_idx" ON "visitors"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_number_key" ON "certificates"("certificate_number");

-- CreateIndex
CREATE INDEX "certificates_paper_id_idx" ON "certificates"("paper_id");

-- CreateIndex
CREATE INDEX "certificates_user_id_idx" ON "certificates"("user_id");

-- CreateIndex
CREATE INDEX "certificates_certificate_number_idx" ON "certificates"("certificate_number");

-- CreateIndex
CREATE INDEX "certificates_type_idx" ON "certificates"("type");

-- CreateIndex
CREATE INDEX "certificates_issued_at_idx" ON "certificates"("issued_at");

-- CreateIndex
CREATE INDEX "certificates_is_valid_idx" ON "certificates"("is_valid");

-- CreateIndex
CREATE INDEX "certificates_revoked_by_idx" ON "certificates"("revoked_by");

-- CreateIndex
CREATE UNIQUE INDEX "seo_configs_page_key" ON "seo_configs"("page");

-- CreateIndex
CREATE INDEX "seo_configs_page_idx" ON "seo_configs"("page");

-- CreateIndex
CREATE INDEX "citations_paper_id_idx" ON "citations"("paper_id");

-- CreateIndex
CREATE INDEX "citations_style_idx" ON "citations"("style");

-- CreateIndex
CREATE INDEX "editorial_board_members_position_idx" ON "editorial_board_members"("position");

-- CreateIndex
CREATE INDEX "editorial_board_members_display_order_idx" ON "editorial_board_members"("display_order");

-- CreateIndex
CREATE INDEX "editorial_board_members_is_active_idx" ON "editorial_board_members"("is_active");

-- CreateIndex
CREATE INDEX "advisory_board_members_display_order_idx" ON "advisory_board_members"("display_order");

-- CreateIndex
CREATE INDEX "advisory_board_members_is_active_idx" ON "advisory_board_members"("is_active");

-- CreateIndex
CREATE INDEX "reviewer_board_members_display_order_idx" ON "reviewer_board_members"("display_order");

-- CreateIndex
CREATE INDEX "reviewer_board_members_is_active_idx" ON "reviewer_board_members"("is_active");

-- CreateIndex
CREATE INDEX "submission_guidelines_category_idx" ON "submission_guidelines"("category");

-- CreateIndex
CREATE INDEX "submission_guidelines_display_order_idx" ON "submission_guidelines"("display_order");

-- CreateIndex
CREATE INDEX "submission_guidelines_is_published_idx" ON "submission_guidelines"("is_published");

-- CreateIndex
CREATE INDEX "peer_review_processes_step_idx" ON "peer_review_processes"("step");

-- CreateIndex
CREATE INDEX "peer_review_processes_display_order_idx" ON "peer_review_processes"("display_order");

-- CreateIndex
CREATE INDEX "peer_review_processes_is_published_idx" ON "peer_review_processes"("is_published");

-- CreateIndex
CREATE INDEX "archives_year_idx" ON "archives"("year");

-- CreateIndex
CREATE INDEX "archives_volume_idx" ON "archives"("volume");

-- CreateIndex
CREATE INDEX "archives_issue_idx" ON "archives"("issue");

-- CreateIndex
CREATE INDEX "archives_is_published_idx" ON "archives"("is_published");

-- CreateIndex
CREATE INDEX "archives_published_at_idx" ON "archives"("published_at");

-- CreateIndex
CREATE INDEX "archive_papers_archive_id_idx" ON "archive_papers"("archive_id");

-- CreateIndex
CREATE INDEX "archive_papers_paper_id_idx" ON "archive_papers"("paper_id");

-- CreateIndex
CREATE UNIQUE INDEX "archive_papers_archive_id_paper_id_key" ON "archive_papers"("archive_id", "paper_id");

-- CreateIndex
CREATE INDEX "chief_patrons_display_order_idx" ON "chief_patrons"("display_order");

-- CreateIndex
CREATE INDEX "chief_patrons_is_active_idx" ON "chief_patrons"("is_active");

-- CreateIndex
CREATE INDEX "deployment_log_type_idx" ON "deployment_log"("type");

-- CreateIndex
CREATE INDEX "deployment_log_status_idx" ON "deployment_log"("status");

-- CreateIndex
CREATE INDEX "deployment_log_created_at_idx" ON "deployment_log"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticket_number_key" ON "support_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "support_tickets_user_id_idx" ON "support_tickets"("user_id");

-- CreateIndex
CREATE INDEX "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateIndex
CREATE INDEX "support_tickets_priority_idx" ON "support_tickets"("priority");

-- CreateIndex
CREATE INDEX "support_tickets_category_idx" ON "support_tickets"("category");

-- CreateIndex
CREATE INDEX "support_tickets_created_at_idx" ON "support_tickets"("created_at");

-- CreateIndex
CREATE INDEX "ticket_replies_ticket_id_idx" ON "ticket_replies"("ticket_id");

-- CreateIndex
CREATE INDEX "ticket_replies_user_id_idx" ON "ticket_replies"("user_id");

-- CreateIndex
CREATE INDEX "ticket_replies_created_at_idx" ON "ticket_replies"("created_at");

-- CreateIndex
CREATE INDEX "ebooks_site_id_idx" ON "ebooks"("site_id");

-- CreateIndex
CREATE INDEX "ebooks_category_idx" ON "ebooks"("category");

-- CreateIndex
CREATE INDEX "ebooks_access_type_idx" ON "ebooks"("access_type");

-- CreateIndex
CREATE INDEX "ebooks_created_by_idx" ON "ebooks"("created_by");

-- CreateIndex
CREATE INDEX "ebooks_is_published_idx" ON "ebooks"("is_published");

-- CreateIndex
CREATE INDEX "ebooks_published_at_idx" ON "ebooks"("published_at");

-- CreateIndex
CREATE INDEX "ebook_purchases_ebook_id_idx" ON "ebook_purchases"("ebook_id");

-- CreateIndex
CREATE INDEX "ebook_purchases_purchased_at_idx" ON "ebook_purchases"("purchased_at");

-- CreateIndex
CREATE INDEX "ebook_purchases_status_idx" ON "ebook_purchases"("status");

-- CreateIndex
CREATE INDEX "ebook_purchases_user_id_idx" ON "ebook_purchases"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ebook_purchases_ebook_id_user_id_key" ON "ebook_purchases"("ebook_id", "user_id");

-- CreateIndex
CREATE INDEX "ebook_views_ebook_id_idx" ON "ebook_views"("ebook_id");

-- CreateIndex
CREATE INDEX "ebook_views_session_id_idx" ON "ebook_views"("session_id");

-- CreateIndex
CREATE INDEX "ebook_views_user_id_idx" ON "ebook_views"("user_id");

-- CreateIndex
CREATE INDEX "ebook_views_viewed_at_idx" ON "ebook_views"("viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "impact_factors_year_key" ON "impact_factors"("year");

-- CreateIndex
CREATE INDEX "impact_factors_site_id_idx" ON "impact_factors"("site_id");

-- CreateIndex
CREATE INDEX "impact_factors_year_idx" ON "impact_factors"("year");

-- CreateIndex
CREATE INDEX "impact_factors_is_active_idx" ON "impact_factors"("is_active");

-- CreateIndex
CREATE INDEX "impact_factors_created_by_idx" ON "impact_factors"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "animation_settings_animation_type_key" ON "animation_settings"("animation_type");

-- CreateIndex
CREATE INDEX "animation_settings_is_enabled_idx" ON "animation_settings"("is_enabled");

-- CreateIndex
CREATE INDEX "animation_settings_animation_type_idx" ON "animation_settings"("animation_type");

-- CreateIndex
CREATE INDEX "team_members_role_idx" ON "team_members"("role");

-- CreateIndex
CREATE INDEX "team_members_display_order_idx" ON "team_members"("display_order");

-- CreateIndex
CREATE INDEX "team_members_is_active_idx" ON "team_members"("is_active");

-- CreateIndex
CREATE INDEX "user_site_access_user_id_idx" ON "user_site_access"("user_id");

-- CreateIndex
CREATE INDEX "user_site_access_site_id_idx" ON "user_site_access"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_site_access_user_id_site_id_key" ON "user_site_access"("user_id", "site_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_provider_idx" ON "api_keys"("provider");

-- CreateIndex
CREATE INDEX "api_keys_is_active_idx" ON "api_keys"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "crossref_journal_settings_site_id_key" ON "crossref_journal_settings"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "crossref_deposits_paper_id_key" ON "crossref_deposits"("paper_id");

-- CreateIndex
CREATE INDEX "crossref_deposits_status_idx" ON "crossref_deposits"("status");

-- CreateIndex
CREATE INDEX "crossref_deposits_site_id_idx" ON "crossref_deposits"("site_id");

-- CreateIndex
CREATE INDEX "crossref_deposits_operator_id_idx" ON "crossref_deposits"("operator_id");

-- CreateIndex
CREATE INDEX "crossref_logs_deposit_id_idx" ON "crossref_logs"("deposit_id");

-- CreateIndex
CREATE INDEX "crossref_logs_created_at_idx" ON "crossref_logs"("created_at");

-- CreateIndex
CREATE INDEX "crossref_xml_versions_paper_id_idx" ON "crossref_xml_versions"("paper_id");

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_assignments" ADD CONSTRAINT "review_assignments_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_assignments" ADD CONSTRAINT "review_assignments_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_assignments" ADD CONSTRAINT "review_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_authors" ADD CONSTRAINT "paper_authors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_authors" ADD CONSTRAINT "paper_authors_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paper_contents" ADD CONSTRAINT "paper_contents_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conferences" ADD CONSTRAINT "conferences_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conferences" ADD CONSTRAINT "conferences_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plagiarism_checks" ADD CONSTRAINT "plagiarism_checks_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plagiarism_checks" ADD CONSTRAINT "plagiarism_checks_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "citations" ADD CONSTRAINT "citations_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_papers" ADD CONSTRAINT "archive_papers_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archive_papers" ADD CONSTRAINT "archive_papers_archive_id_fkey" FOREIGN KEY ("archive_id") REFERENCES "archives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_replies" ADD CONSTRAINT "ticket_replies_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ebooks" ADD CONSTRAINT "ebooks_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ebooks" ADD CONSTRAINT "ebooks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ebook_purchases" ADD CONSTRAINT "ebook_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ebook_purchases" ADD CONSTRAINT "ebook_purchases_ebook_id_fkey" FOREIGN KEY ("ebook_id") REFERENCES "ebooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ebook_views" ADD CONSTRAINT "ebook_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ebook_views" ADD CONSTRAINT "ebook_views_ebook_id_fkey" FOREIGN KEY ("ebook_id") REFERENCES "ebooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impact_factors" ADD CONSTRAINT "impact_factors_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "impact_factors" ADD CONSTRAINT "impact_factors_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_site_access" ADD CONSTRAINT "user_site_access_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_site_access" ADD CONSTRAINT "user_site_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crossref_journal_settings" ADD CONSTRAINT "crossref_journal_settings_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crossref_deposits" ADD CONSTRAINT "crossref_deposits_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crossref_deposits" ADD CONSTRAINT "crossref_deposits_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crossref_deposits" ADD CONSTRAINT "crossref_deposits_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crossref_logs" ADD CONSTRAINT "crossref_logs_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crossref_logs" ADD CONSTRAINT "crossref_logs_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "crossref_deposits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crossref_xml_versions" ADD CONSTRAINT "crossref_xml_versions_paper_id_fkey" FOREIGN KEY ("paper_id") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

I N S E R T   I N T O   u s e r s   ( i d ,   e m a i l ,   p a s s w o r d _ h a s h ,   f i r s t _ n a m e ,   l a s t _ n a m e ,   r o l e ,   i s _ v e r i f i e d ,   c r e a t e d _ a t ,   u p d a t e d _ a t )   V A L U E S   ( ' a d m i n - i d - 1 2 3 ' ,   ' a d m i n @ v a - r a . c o m ' ,   ' $ 2 a $ 1 0 $ v / r 8 B 8 T U 2 G r i c Q Z I P O U i X e Z 2 l z M 9 L S 4 O s E m 9 l c P O g f f X 8 W v r p w 5 e 6 ' ,   ' A d m i n ' ,   ' U s e r ' ,   ' A D M I N ' ,   t r u e ,   N O W ( ) ,   N O W ( ) ) ;  
 