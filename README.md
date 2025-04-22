# Claimr: AI-Powered RMA Automation System

Claimr is an intelligent agent-based system that automates the RMA process with AV equipment vendors. By eliminating pain points like phone wait times, language barriers, and frustrating vendor portals, Claimr revolutionizes equipment replacement workflows for field technicians.

Built on Google Vertex AI using cutting-edge agent communication protocols (A2A, MCP, ADK), Claimr provides a seamless, reliable, and scalable RMA automation platform.

## Features

- **Fully Automated RMA Workflow** - End-to-end processing from submission to confirmation
- **Multi-Vendor Support** - Integrations with QSC, Biamp, Crestron, Extron, Samsung, LG, NEC, and Epson
- **Intelligent Routing** - Automatic vendor detection and optimal pathway selection
- **Real-Time Updates** - Email notifications at key workflow stages
- **Comprehensive Logging** - Complete audit trail of all agent actions
- **Error Recovery** - Automatic retry and human escalation protocols
- **Modular Architecture** - Clean separation of concerns for easy maintenance and extension
- **Cloud-Native** - Designed for Google Cloud's Vertex AI platform
- **Secure and Compliant** - API key management and secure data handling

## Agent Architecture

```
┌────────────┐     ┌─────────────┐     ┌─────────────────┐
│            │     │             │     │                 │
│  ReqWest   │────▶│ TraceRoute  │────▶│  FormBot Mesh   │
│  (Intake)  │     │ (Routing)   │     │  (Submission)   │
│            │     │             │     │                 │
└────────────┘     └─────────────┘     └────────┬────────┘
                                                │
                                                ▼
┌────────────┐     ┌─────────────┐     ┌─────────────────┐
│            │     │             │     │                 │
│  Failsafe  │◀────│   Ledger    │◀────│      Echo       │
│ (Recovery) │     │  (Logging)  │     │ (Confirmation)  │
│            │     │             │     │                 │
└────────────┘     └─────────────┘     └─────────────────┘


FormBot Vendor Modules:
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │   QSC   │  │  Biamp   │  │ Crestron │  │ Extron │ │
│  └─────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                      │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Samsung │  │    LG    │  │   NEC    │  │ Epson  │ │
│  └─────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Agent Roles

- **ReqWest** - RMA intake agent that collects initial information
- **TraceRoute** - Vendor navigation agent that determines optimal routing
- **FormBot** - Modular form submission agent with vendor-specific handlers
- **Echo** - Confirmation agent that sends email notifications
- **Ledger** - Logging agent that maintains an audit trail
- **Failsafe** - Error recovery agent that handles retries and escalations

## Setup and Installation

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account and project
- Resend account for email sending
- Google Cloud account with Vertex AI access

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Core Configuration
A2A_HOST=https://your-deployment-url.com

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-api-key

# Email Configuration
RESEND_API_KEY=your-resend-api-key

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# Vendor API Keys
QSC_API_KEY=your-qsc-api-key
QSC_API_URL=https://api.qsc.com/rma/submit

BIAMP_API_KEY=your-biamp-api-key
BIAMP_API_URL=https://api.biamp.com/rma/create

CRESTRON_API_KEY=your-crestron-api-key
CRESTRON_API_URL=https://api.crestron.com/support/rma

EXTRON_API_KEY=your-extron-api-key
EXTRON_API_URL=https://api.extron.com/rma/submit

SAMSUNG_API_KEY=your-samsung-api-key
SAMSUNG_API_URL=https://api.samsung.com/support/rma/create

LG_API_KEY=your-lg-api-key
LG_API_URL=https://api.lg.com/service/rma

NEC_API_KEY=your-nec-api-key
NEC_API_URL=https://api.nec.com/rma/submit

EPSON_API_KEY=your-epson-api-key
EPSON_API_URL=https://api.epson.com/support/rma
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/claimr.git
   cd claimr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the Supabase database:
   ```bash
   npx supabase db push ./supabase/schema.sql
   ```

## Usage

### Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The API endpoints will be available at:
   - RMA Intake: `http://localhost:3000/api/agents/reqwest`
   - Vendor Routing: `http://localhost:3000/api/agents/traceroute`
   - Form Submission: `http://localhost:3000/api/agents/formbot`
   - Confirmation: `http://localhost:3000/api/agents/echo`
   - Logging: `http://localhost:3000/api/agents/ledger`
   - Error Recovery: `http://localhost:3000/api/agents/failsafe`

3. Example RMA submission:
   ```bash
   curl -X POST http://localhost:3000/api/agents/reqwest \
     -H "Content-Type: application/json" \
     -d '{
       "serial_number": "ABC123456",
       "model_number": "QSC-K12.2",
       "issue_description": "No power to unit",
       "vendor": "QSC",
       "submitted_by": "technician@example.com"
     }'
   ```

### CallBot Setup

1. Add Twilio **and Resend** credentials to `.env`  
2. Run `supabase db push` to add `call_sid / rma_number` columns  
3. Deploy and grant your technicians the `CLAIMR_API_TOKEN`  
4. FormBot now triggers Echo to send confirmation emails automatically.

### Vertex AI Deployment

1. Build the container images for each pipeline component:
   ```bash
   cd pipelines
   ./build_components.sh
   ```

2. Deploy the pipeline to Vertex AI:
   ```bash
   gcloud ai pipelines create \
     --pipeline-file=./pipelines/claimr_pipeline.yaml \
     --project=$GOOGLE_CLOUD_PROJECT \
     --region=$GOOGLE_CLOUD_LOCATION
   ```

3. Trigger a pipeline run:
   ```bash
   gcloud ai pipelines run claimr-rma-automation-pipeline \
     --parameter=serial_number=ABC123456 \
     --parameter=model_number=QSC-K12.2 \
     --parameter=issue_description="No power to unit" \
     --parameter=vendor=QSC \
     --parameter=submitted_by=technician@example.com \
     --project=$GOOGLE_CLOUD_PROJECT \
     --region=$GOOGLE_CLOUD_LOCATION
   ```

## Project Structure

```
/claimr
  ├── /agents                     # Agent-specific logic
  │   ├── /reqwest                # RMA intake agent
  │   │   ├── agent.json          # Agent metadata
  │   │   └── introspect.ts       # ADK-compliant introspection
  │   ├── /traceroute             # Vendor routing agent
  │   ├── /formbot                # Form submission agent
  │   │   └── /vendorModules      # Vendor-specific modules
  │   │       ├── types.ts        # Shared type definitions
  │   │       ├── qsc.ts          # QSC vendor integration
  │   │       ├── biamp.ts        # Biamp vendor integration
  │   │       └── ...             # Other vendor modules
  │   ├── /echo                   # Confirmation agent
  │   ├── /ledger                 # Logging agent
  │   └── /failsafe               # Error recovery agent
  ├── /lib                        # Shared utilities
  │   ├── a2aMessaging.ts         # A2A protocol implementation
  │   ├── logAgentAction.ts       # Action logging utility
  │   ├── resendClient.ts         # Email client configuration
  │   ├── sendToMCP.ts            # MCP protocol implementation
  │   └── supabaseClient.ts       # Database client configuration
  ├── /pages                      # Next.js pages
  │   └── /api                    # API routes
  │       └── /agents             # Agent endpoints
  │           ├── reqwest.ts      # RMA intake endpoint
  │           ├── traceroute.ts   # Vendor routing endpoint
  │           ├── formbot.ts      # Form submission endpoint
  │           ├── formbot_qsc.ts  # QSC-specific endpoint
  │           └── ...             # Other agent endpoints
  ├── /pipelines                  # Vertex AI pipeline definition
  │   ├── /components             # Pipeline component wrappers
  │   │   ├── reqwest.py          # RMA intake component
  │   │   ├── traceroute.py       # Routing component
  │   │   └── ...                 # Other component wrappers
  │   └── claimr_pipeline.yaml    # Pipeline definition
  ├── /supabase                   # Database configuration
  │   └── schema.sql              # Database schema
  ├── /types                      # TypeScript type definitions
  │   └── supabase.ts             # Database type definitions
  ├── .env.example                # Example environment variables
  ├── package.json                # Project dependencies
  ├── tsconfig.json               # TypeScript configuration
  └── README.md                   # Project documentation
```

## Roadmap

### Short-term (Q2-Q3 2025)
- Expand vendor integrations to include additional equipment manufacturers
- Add support for attachment upload in RMA submissions
- Implement status tracking with periodic vendor API checks
- Enable batch processing for multiple RMAs

### Mid-term (Q4 2025 - Q1 2026)
- Develop a technician-facing dashboard for RMA status monitoring
- Add voice interface support via telephony integration
- Implement predictive analysis for common equipment failures
- Create vendor-specific templates for optimal form submission

### Long-term (Q2-Q4 2026)
- Integrate with inventory management systems
- Add predictive shipping and logistics tracking
- Implement AI-assisted troubleshooting before RMA creation
- Enable cross-vendor warranty verification

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is proprietary and confidential.

---

Built with ❤️ by Your Organization • April 2025
