# Poultry Management System API (Node.js + Express + TypeORM)

A production-ready REST API converted from ASP.NET Core (C#) to Node.js & Express, powered by TypeORM and PostgreSQL. The project follows the modular architecture of `motocurv-api`.

## 🏗 Architecture Overview

The repository structure follows modern clean architecture principles with feature-sliced modules:

```
poultry-express/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js                          # Express application configuration
    ├── index.js                        # Server entry point & graceful shutdown
    ├── core/                           # Shared core services & utilities
    │   ├── config/
    │   │   └── env.config.js           # Validated environment configuration (Joi)
    │   ├── constants/
    │   │   ├── constants.js            # Business constants (e.g., BATCH_STATUS)
    │   │   └── httpStatus.js           # HTTP status code constants
    │   ├── database/
    │   │   └── dbConnect.js            # TypeORM DataSource & connection lifecycle
    │   ├── middlewares/
    │   │   ├── auth.middleware.js      # JWT Bearer authentication
    │   │   ├── error.middleware.js     # Global error handler
    │   │   ├── requestId.js            # Request ID tracing
    │   │   └── validate.middleware.js  # Joi request schema validation
    │   └── utils/
    │       ├── ApiError.js             # Standardized operational error class
    │       ├── asyncHandler.js         # Async route wrapper
    │       ├── dateHelper.js           # UTC date normalizer
    │       ├── jwtHelper.js            # JWT generator and token validator
    │       ├── logger.js               # Winston logging service
    │       └── response.js             # Standardized success & error responses
    ├── entities/                       # TypeORM EntitySchemas (PostgreSQL)
    │   ├── User.entity.js              # tbl_user
    │   ├── Batch.entity.js             # tbl_batch
    │   ├── BirdInventory.entity.js     # tbl_birdInventory
    │   ├── DailyRecord.entity.js       # tbl_dailyRegister
    │   ├── FeedInventory.entity.js     # tbl_feedInventory
    │   ├── FinalReport.entity.js       # tbl_finalReport
    │   ├── StockOutMaster.entity.js    # tbl_stockOut
    │   ├── StockOutEntry.entity.js     # tbl_stockOutEntry
    │   └── index.js
    ├── modules/                        # Feature-sliced domain modules
    │   ├── auth/                       # Auth endpoints (/api/Auth)
    │   │   ├── auth.controller.js
    │   │   ├── auth.route.js
    │   │   ├── auth.service.js
    │   │   └── auth.validation.js
    │   ├── batch/                      # Batch endpoints (/api/Batch)
    │   ├── bird-inventory/             # Bird arrival & inventory (/api/BirdsInventory)
    │   ├── daily-record/               # Daily logs & mortality (/api/DailyRecord)
    │   ├── dashboard/                  # Batch statistics & KPIs (/api/DashBoard)
    │   ├── feed-inventory/             # Feed arrival records (/api/FeedInventory)
    │   ├── final-report/               # Harvest & batch settlement (/api/FinalReport)
    │   └── stockout/                   # Stock out master & entries (/api/stockout/*)
    └── routes/
        └── index.js                    # Auto-discovering dynamic route loader
```

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database (or Neon/Supabase cloud instance)

### 2. Environment Configuration
Copy `.env.example` to `.env` and update your PostgreSQL connection string:
```bash
cp .env.example .env
```

### 3. Installation
```bash
npm install
```

### 4. Running the Application
```bash
# Development mode with hot-reloading
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints Reference

### 🔐 Auth (`/api/Auth` or `/api/auth`)
- `POST /api/Auth/login` - User login with JWT generation
- `POST /api/Auth/signup` - User registration

### 📦 Batch (`/api/Batch` or `/api/batch`)
- `GET /api/Batch` - Fetch all batches with inventories & records
- `GET /api/Batch/active` - Get the currently active/ongoing batch
- `POST /api/Batch` - Create a new batch (prevents concurrent active batches)
- `PATCH /api/Batch/close/:batchId` - Close an active batch

### 🐥 Bird Inventory (`/api/BirdsInventory` or `/api/birdsinventory`)
- `GET /api/BirdsInventory` - Fetch all bird inventories
- `GET /api/BirdsInventory/:id` - Fetch bird inventory by batch ID
- `POST /api/BirdsInventory` - Add bird arrival and initiate batch
- `PUT /api/BirdsInventory/:id` - Update bird inventory
- `PATCH /api/BirdsInventory/soft-delete/:id` - Soft delete bird inventory
- `DELETE /api/BirdsInventory/:id` - Permanently delete bird inventory

### 📋 Daily Records (`/api/DailyRecord` or `/api/dailyrecord`)
- `GET /api/DailyRecord` - Get daily records for active batch
- `GET /api/DailyRecord/:batchId` - Get daily records for specific batch
- `POST /api/DailyRecord` - Add record (validates feed & bird balance)
- `PUT /api/DailyRecord/:id` - Update daily record
- `PATCH /api/DailyRecord/soft-delete/:id` - Soft delete daily record
- `DELETE /api/DailyRecord/:id` - Permanently delete daily record

### 📊 Dashboard (`/api/DashBoard` or `/api/dashboard`) [Requires Bearer Token]
- `GET /api/DashBoard` - Real-time batch metrics (mortality, alive birds, feed balance)

### 🌾 Feed Inventory (`/api/FeedInventory` or `/api/feedinventory`)
- `GET /api/FeedInventory` - Get feed inventories for active batch
- `POST /api/FeedInventory` - Record feed arrival
- `PUT /api/FeedInventory/:id` - Update feed inventory
- `PATCH /api/FeedInventory/soft-delete/:id` - Soft delete feed inventory
- `DELETE /api/FeedInventory/:id` - Permanently delete feed inventory

### 📑 Final Report (`/api/FinalReport` or `/api/finalreport`)
- `GET /api/FinalReport` - Fetch all final reports
- `GET /api/FinalReport/:id` - Fetch final report by ID
- `POST /api/FinalReport` - Generate final batch settlement report
- `PUT /api/FinalReport/:id` - Update report details
- `PATCH /api/FinalReport/soft-delete/:id` - Soft delete report
- `DELETE /api/FinalReport/:id` - Permanently delete report

### 🚚 Stock Out (`/api/stockout`)
- `GET /api/stockout/master` - Fetch stock out masters for active batch
- `GET /api/stockout/master/:masterId` - Fetch stock out master with entries
- `POST /api/stockout/master` - Create a new stock out master
- `PUT /api/stockout/master/finalize/:id` - Finalize master weights & bird count
- `GET /api/stockout/entry/:masterId` - Get entries for a master
- `POST /api/stockout/entry` - Add a stock out entry
- `PUT /api/stockout/entry/:id` - Update an entry
- `DELETE /api/stockout/entry/:id` - Delete an entry
