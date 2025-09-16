-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('TURIST', 'PROPRIETAR', 'ADMIN');

-- CreateEnum
CREATE TYPE "StareRezervare" AS ENUM ('CONFIRMAT', 'ANULAT', 'NEACHITAT', 'ACHITAT', 'RAMBURSAT');

-- CreateEnum
CREATE TYPE "TipFisier" AS ENUM ('IMAGINE', 'VIDEO');

-- CreateTable
CREATE TABLE "utilizatori" (
    "id" SERIAL NOT NULL,
    "google_id" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "parola_hash" VARCHAR(255),
    "rol" "Rol" NOT NULL DEFAULT 'TURIST',
    "nume" VARCHAR(255) NOT NULL,
    "prenume" VARCHAR(255) NOT NULL,
    "telefon" VARCHAR(15) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilizatori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cabane" (
    "id" SERIAL NOT NULL,
    "denumire" VARCHAR(255) NOT NULL,
    "locatie" VARCHAR(255) NOT NULL,
    "altitudine" INTEGER NOT NULL,
    "contact_email" VARCHAR(255) NOT NULL,
    "contact_telefon" VARCHAR(15) NOT NULL,
    "descriere" TEXT,
    "scor_recenzii" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_utilizator" INTEGER NOT NULL,

    CONSTRAINT "cabane_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camere" (
    "id" SERIAL NOT NULL,
    "nr_camera" INTEGER NOT NULL,
    "nr_persoane" INTEGER NOT NULL,
    "pret_noapte" DECIMAL(10,2) NOT NULL,
    "descriere" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_cabana" INTEGER NOT NULL,

    CONSTRAINT "camere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rezervari" (
    "id" SERIAL NOT NULL,
    "data_sosire" TIMESTAMP(3) NOT NULL,
    "data_plecare" TIMESTAMP(3) NOT NULL,
    "nr_persoane" INTEGER NOT NULL,
    "pret_total" DECIMAL(10,2) NOT NULL,
    "stare_rezervare" "StareRezervare" NOT NULL DEFAULT 'CONFIRMAT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_utilizator" INTEGER NOT NULL,

    CONSTRAINT "rezervari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "tip" "TipFisier" NOT NULL DEFAULT 'IMAGINE',
    "descriere" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_cabana" INTEGER,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recenzii" (
    "id" SERIAL NOT NULL,
    "scor" INTEGER NOT NULL,
    "descriere" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "id_cabana" INTEGER NOT NULL,
    "id_utilizator" INTEGER NOT NULL,

    CONSTRAINT "recenzii_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CameraToRezervare" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CameraToRezervare_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilizatori_email_key" ON "utilizatori"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilizatori_telefon_key" ON "utilizatori"("telefon");

-- CreateIndex
CREATE UNIQUE INDEX "cabane_contact_email_key" ON "cabane"("contact_email");

-- CreateIndex
CREATE UNIQUE INDEX "cabane_contact_telefon_key" ON "cabane"("contact_telefon");

-- CreateIndex
CREATE INDEX "cabane_id_utilizator_idx" ON "cabane"("id_utilizator");

-- CreateIndex
CREATE INDEX "camere_id_cabana_idx" ON "camere"("id_cabana");

-- CreateIndex
CREATE UNIQUE INDEX "camere_id_cabana_nr_camera_key" ON "camere"("id_cabana", "nr_camera");

-- CreateIndex
CREATE INDEX "rezervari_id_utilizator_idx" ON "rezervari"("id_utilizator");

-- CreateIndex
CREATE UNIQUE INDEX "media_url_key" ON "media"("url");

-- CreateIndex
CREATE INDEX "media_id_cabana_idx" ON "media"("id_cabana");

-- CreateIndex
CREATE INDEX "recenzii_id_cabana_idx" ON "recenzii"("id_cabana");

-- CreateIndex
CREATE INDEX "_CameraToRezervare_B_index" ON "_CameraToRezervare"("B");

-- AddForeignKey
ALTER TABLE "cabane" ADD CONSTRAINT "cabane_id_utilizator_fkey" FOREIGN KEY ("id_utilizator") REFERENCES "utilizatori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camere" ADD CONSTRAINT "camere_id_cabana_fkey" FOREIGN KEY ("id_cabana") REFERENCES "cabane"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rezervari" ADD CONSTRAINT "rezervari_id_utilizator_fkey" FOREIGN KEY ("id_utilizator") REFERENCES "utilizatori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_id_cabana_fkey" FOREIGN KEY ("id_cabana") REFERENCES "cabane"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recenzii" ADD CONSTRAINT "recenzii_id_cabana_fkey" FOREIGN KEY ("id_cabana") REFERENCES "cabane"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recenzii" ADD CONSTRAINT "recenzii_id_utilizator_fkey" FOREIGN KEY ("id_utilizator") REFERENCES "utilizatori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CameraToRezervare" ADD CONSTRAINT "_CameraToRezervare_A_fkey" FOREIGN KEY ("A") REFERENCES "camere"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CameraToRezervare" ADD CONSTRAINT "_CameraToRezervare_B_fkey" FOREIGN KEY ("B") REFERENCES "rezervari"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Reservation must be for at least 1 person
ALTER TABLE "rezervari"
ADD CONSTRAINT rezervari_nr_persoane_check
CHECK ("nr_persoane" > 0);

-- Prevent rezervari in the past
ALTER TABLE "rezervari"
ADD CONSTRAINT rezervari_data_sosire_in_future
CHECK ("data_sosire" >= now());

-- Check for data_plecare > data_sosire
ALTER TABLE "rezervari"
ADD CONSTRAINT rezervari_interval_valid
CHECK ("data_plecare" > "data_sosire");

-- Prevents negative price on rezervari
ALTER TABLE "rezervari"
ADD CONSTRAINT rezervari_pret_total_positive 
CHECK ("pret_total" >= 0);

-- Room price must be positive (pick ONE of the two)
ALTER TABLE "camere"
ADD CONSTRAINT camere_pret_noapte_check
CHECK ("pret_noapte" > 0.00);

-- Ensure rooms are for at least 1 person
ALTER TABLE "camere"
ADD CONSTRAINT camere_nr_persoane_check
CHECK ("nr_persoane" > 0);

-- Ensure utilizatori email format
ALTER TABLE "utilizatori"
ADD CONSTRAINT utilizatori_email_format_check
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure utilizatori telefon format
ALTER TABLE "utilizatori"
ADD CONSTRAINT utilizatori_telefon_format_check
CHECK (telefon ~* '^(\+4)?0?7[0-9]{8}$');

-- Ensure cabane email format
ALTER TABLE "cabane"
ADD CONSTRAINT cabane_email_format_check
CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure cabane telefon format
ALTER TABLE "cabane"
ADD CONSTRAINT cabane_telefon_format_check
CHECK (contact_telefon ~* '^(\+4)?0?7[0-9]{8}$');

-- Ensure cabane are not below sea level
ALTER TABLE "cabane"
ADD CONSTRAINT cabane_altitudine_check
CHECK ("altitudine" > 0);

-- Ensure scor cabane is between 0 and 5
ALTER TABLE "cabane"
ADD CONSTRAINT cabane_scor_recenzii_range_check
CHECK ("scor_recenzii" BETWEEN 0 AND 5);

-- Ensure scor recenzii is between 0 and 5
ALTER TABLE "recenzii"
ADD CONSTRAINT recenzii_scor_range_check
CHECK ("scor" BETWEEN 0 AND 5);

-- Avoid duplicate recenzii by same user for same cabana
ALTER TABLE "recenzii"
ADD CONSTRAINT recenzii_unique_by_user
UNIQUE ("id_utilizator", "id_cabana");
