flowchart TB
  %% User-facing pipeline
  subgraph User Interaction
    direction TB
    U[User Voice Input] -->|speech| VS[Voice-to-Text Service]
    VS -->|text| LLM[LLM Engine]
    LLM --> CMD[Command Parser]
    CMD --> CHK{Multiple Files Match?}
    CHK -- Yes --> U
    CHK -- No --> EXE[Execute Command]
    EXE --> PPT[PowerPoint Service]
    PPT --> U
  end

  %% Offline metadata pipeline
  subgraph Offline Process
    direction TB
    SCAN[Directory Scanner PPT files] --> ID[ID Assigner & Path Mapper]
    ID --> EXT[Content Extractor Text, Images, Videos]
    EXT --> TXTCHK{Text Found?}
    TXTCHK -- Yes --> RAKE1[RAKE Keyword Extractor]
    TXTCHK -- No --> OCR[Vision AI OCR] --> RAKE2[RAKE Keyword Extractor]
    RAKE1 --> TRAIN[Metadata Trainer]
    RAKE2 --> TRAIN
    TRAIN --> METADB[Metadata Store by slide & keywords]
  end

  %% Glue
  METADB -->|commands & lookups| CMD



  architecture-beta
    %% User Interaction group
    group user_interaction(cloud)[User Interaction]
        service user(mdi:account-voice)[User Voice Input]
        service vtt(mdi:microphone-message)[Voice-to-Text Service]
        service llm(mdi:robot)[LLM Engine]
        service cmd(mdi:code-json)[Command Parser]
        service ppt(mdi:application)[PowerPoint Service]
        service exe(server)[Execution Engine]
    end

    %% Offline Process group
    group offline_proc(database)[Offline Process]
        service scanner(mdi:folder-search)[Directory Scanner]
        service ider(mdi:file-key)[ID Assigner/Path Mapper]
        service exter(mdi:file-find)[Content Extractor]
        service ocr(mdi:image-search)[Vision AI OCR]
        service rake(mdi:format-list-bulleted)[RAKE Keyword Extractor]
        service train(mdi:database-edit)[Metadata Trainer]
        service metadb(database)[Metadata Store]
    end

    %% Connections in UI pipeline
    user:R --> L:vtt
    vtt:R --> L:llm
    llm:R --> L:cmd
    cmd:B --> T:exe
    exe:R --> L:ppt
    ppt:R -- R:user

    %% Connections in Offline pipeline
    scanner:R --> L:ider
    ider:R --> L:exter
    exter:B --> T:ocr
    exter:B --> B:rake
    ocr:R --> L:rake
    rake:B --> T:train
    train:B --> T:metadb

    %% Cross-pipeline connection
    metadb:T --> B:cmd
