
# CabanApp

Bachelor's thesis

## Database ER Diagram

```mermaid
erDiagram
    UTILIZATORI {
      int id PK
      string google_id
      string email
      string parola_hash
      string rol
      string nume
      string prenume
      string telefon
      datetime created_at
      datetime updated_at
    }

    CABANE {
      int id PK
      string denumire
      string locatie
      int altitudine
      string contact_email
      string contact_telefon
      string descriere
      float scor_recenzii
      datetime created_at
      datetime updated_at
      int id_utilizator FK
    }

    CAMERE {
      int id PK
      int nr_camera
      int nr_persoane
      float pret_noapte
      string descriere
      datetime created_at
      datetime updated_at
      int id_cabana FK
    }

    MEDIA {
      int id PK
      string url
      string tip
      string descriere
      datetime created_at
      datetime updated_at
      int id_cabana FK
    }

    RECENZII {
      int id PK
      int scor
      string descriere
      datetime created_at
      datetime updated_at
      int id_cabana FK
      int id_utilizator FK
    }

    REZERVARI {
      int id PK
      date data_sosire
      date data_plecare
      int nr_persoane
      float pret_total
      string stare_rezervare
      datetime created_at
      datetime updated_at
      int id_utilizator FK
    }

    _CAMERATOREZERVARE {
      int A  "FK -> CAMERE.id"
      int B  "FK -> REZERVARI.id"
    }

    PRISMA_MIGRATIONS {
      string id PK
      string checksum
      datetime finished_at
      string migration_name
      string logs
      datetime rolled_back_at
      datetime started_at
      int applied_steps_count
    }

    CABANE }o--|| UTILIZATORI : "id_utilizator → UTILIZATORI.id"
    CAMERE }o--|| CABANE      : "id_cabana → CABANE.id"
    MEDIA }o--|| CABANE       : "id_cabana → CABANE.id"
    RECENZII }o--|| CABANE    : "id_cabana → CABANE.id"
    RECENZII }o--|| UTILIZATORI : "id_utilizator → UTILIZATORI.id"
    REZERVARI }o--|| UTILIZATORI : "id_utilizator → UTILIZATORI.id"

    _CAMERATOREZERVARE }o--|| CAMERE     : "A → CAMERE.id"
    _CAMERATOREZERVARE }o--|| REZERVARI  : "B → REZERVARI.id"
