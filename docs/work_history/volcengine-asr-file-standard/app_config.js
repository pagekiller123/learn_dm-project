// volcengine-asr-file-standard app 配置
// 来源: MongoDB tmax.dreamworker_apps (test 环境)
// 读取时间: 2026-07-12

db.dreamworker_apps.replaceOne(
  { name: "volcengine-asr-file-standard" },
  {
    "name": "volcengine-asr-file-standard",
    "display_name": "火山引擎文件语音识别（标准版）",
    "desc": "火山引擎文件语音识别（标准版），把音频文件 URL 转写成带时间戳的文字",
    "cover": "",
    "status": 1,
    "demo_url": "",
    "sf_url": "",
    "deploy_type": "outer-cert",
    "type": "recommend",
    "creator": "grp.dreammaker",
    "app_url": "",
    "group_id": [],
    "create_time": 1783415064,
    "update_time": 1783415064,
    "is_top": 0,
    "env": "test",
    "api_open": true,
    "api_open_type": "model",
    "api_models": [
      "volcengine-asr-file-standard"
    ],
    "api_info": {
      "option_label": "语音识别能力",
      "alive_conf": {},
      "app_list": {
        "default": "volcengine-asr-file-standard",
        "items": [
          {
            "label": "文件语音识别",
            "children": [
              "volcengine-asr-file-standard"
            ],
            "auto_open": true
          }
        ]
      },
      "app_map": {
        "volcengine-asr-file-standard": {
          "sub_app_name": "volcengine-asr-file-standard",
          "show_name": "文件语音识别（标准版）",
          "source": "volc-asr-file",
          "need_pay": 1,
          "preprocess": false,
          "postprocess": false,
          "max_image_size": 0,
          "model_field": "model",
          "params": [
            {
              "_type": "Str",
              "show_name": "model",
              "real_name": "model",
              "essential": 0,
              "default": "volcengine-asr-file-standard",
              "info": {
                "hidden": true,
                "mini_conf": {
                  "diy_options": [
                    {
                      "label": "文件语音识别（标准版）",
                      "value": "volcengine-asr-file-standard"
                    }
                  ]
                }
              }
            },
            {
              "_type": "Str",
              "show_name": "model_name",
              "real_name": "model_name",
              "essential": 0,
              "default": "bigmodel",
              "info": {
                "hidden": true,
                "mini_conf": {
                  "diy_options": [
                    {
                      "label": "bigmodel",
                      "value": "bigmodel"
                    }
                  ]
                }
              }
            },
            {
              "_type": "Str",
              "show_name": "音频 URL",
              "real_name": "audio.url",
              "essential": 1,
              "placeholder": "https://example.com/audio.wav"
            },
            {
              "_type": "Str",
              "show_name": "音频格式",
              "real_name": "audio.format",
              "essential": 0,
              "default": "wav",
              "info": {
                "mini_conf": {
                  "diy_options": [
                    {
                      "label": "wav",
                      "value": "wav"
                    },
                    {
                      "label": "mp3",
                      "value": "mp3"
                    },
                    {
                      "label": "ogg",
                      "value": "ogg"
                    },
                    {
                      "label": "m4a",
                      "value": "m4a"
                    },
                    {
                      "label": "flac",
                      "value": "flac"
                    },
                    {
                      "label": "opus",
                      "value": "opus"
                    },
                    {
                      "label": "aac",
                      "value": "aac"
                    }
                  ]
                }
              }
            },
            {
              "_type": "Str",
              "show_name": "音频语言",
              "real_name": "audio.language",
              "essential": 0,
              "desc": "音频语言代码，如 zh-CN、en-US，不传则由火山自动识别"
            },
            {
              "_type": "Str",
              "show_name": "音频编码",
              "real_name": "audio.codec",
              "essential": 0,
              "desc": "音频编码格式，如 raw、pcm"
            },
            {
              "_type": "Num",
              "show_name": "采样率",
              "real_name": "audio.rate",
              "essential": 0,
              "desc": "音频采样率（Hz），如 16000、44100。不传由火山自动检测"
            },
            {
              "_type": "Num",
              "show_name": "位深度",
              "real_name": "audio.bits",
              "essential": 0,
              "desc": "音频位深度，如 8、16、24"
            },
            {
              "_type": "Num",
              "show_name": "声道数",
              "real_name": "audio.channel",
              "essential": 0,
              "desc": "声道数，1（单声道）或 2（立体声），默认 1"
            },
            {
              "_type": "Bool",
              "show_name": "启用文本规整（ITN）",
              "real_name": "request.enable_itn",
              "essential": 0,
              "default": true,
              "desc": "将口语化表达转为书面语，如\"二零二六\" -> \"2026\""
            },
            {
              "_type": "Bool",
              "show_name": "启用标点",
              "real_name": "request.enable_punc",
              "essential": 0,
              "default": true,
              "desc": "在识别结果中添加标点符号"
            },
            {
              "_type": "Bool",
              "show_name": "启用说话人分离",
              "real_name": "request.enable_speaker_info",
              "essential": 0,
              "default": false,
              "desc": "区分不同说话人，返回 speaker 字段"
            },
            {
              "_type": "Bool",
              "show_name": "返回分句结果",
              "real_name": "request.show_utterances",
              "essential": 0,
              "default": true,
              "desc": "返回逐句识别结果及字级时间戳"
            },
            {
              "_type": "Str",
              "show_name": "SSD 版本",
              "real_name": "request.ssd_version",
              "essential": 0,
              "info": {
                "hidden": true
              },
              "desc": "语音识别模型版本，不传使用服务默认版本"
            },
            {
              "_type": "Bool",
              "show_name": "启用深度去噪（DDC）",
              "real_name": "request.enable_ddc",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              }
            },
            {
              "_type": "Bool",
              "show_name": "启用声道分离",
              "real_name": "request.enable_channel_split",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              },
              "desc": "双声道音频时按声道分离后分别识别"
            },
            {
              "_type": "Bool",
              "show_name": "返回语速信息",
              "real_name": "request.show_speech_rate",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              }
            },
            {
              "_type": "Bool",
              "show_name": "返回音量信息",
              "real_name": "request.show_volume",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              }
            },
            {
              "_type": "Bool",
              "show_name": "启用自动语言检测",
              "real_name": "request.enable_auto_lang",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              }
            },
            {
              "_type": "Bool",
              "show_name": "启用语种识别（LID）",
              "real_name": "request.enable_lid",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              }
            },
            {
              "_type": "Bool",
              "show_name": "启用情绪检测",
              "real_name": "request.enable_emotion_detection",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              }
            },
            {
              "_type": "Bool",
              "show_name": "启用性别检测",
              "real_name": "request.enable_gender_detection",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              }
            },
            {
              "_type": "Bool",
              "show_name": "启用 VAD 分段",
              "real_name": "request.vad_segment",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              },
              "desc": "将长音频自动切分为多个片段逐段识别"
            },
            {
              "_type": "Num",
              "show_name": "结束窗口大小",
              "real_name": "request.end_window_size",
              "essential": 0,
              "info": {
                "hidden": true
              },
              "desc": "VAD 模式下静音判定窗口大小（毫秒），默认由模型自动决定"
            },
            {
              "_type": "Str",
              "show_name": "敏感词过滤",
              "real_name": "request.sensitive_words_filter",
              "essential": 0,
              "info": {
                "hidden": true
              },
              "desc": "敏感词列表，匹配到的词将被替换为*号。不传不过滤"
            },
            {
              "_type": "Bool",
              "show_name": "启用 POI 识别",
              "real_name": "request.enable_poi_fc",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              },
              "desc": "识别结果中标注地点等 POI 信息"
            },
            {
              "_type": "Bool",
              "show_name": "启用音乐识别",
              "real_name": "request.enable_music_fc",
              "essential": 0,
              "default": false,
              "info": {
                "hidden": true
              },
              "desc": "识别音频中是否包含音乐"
            },
            {
              "_type": "Str",
              "show_name": "热词表名",
              "real_name": "request.corpus.boosting_table_name",
              "essential": 0,
              "info": {
                "hidden": true
              },
              "desc": "火山控制台上传的热词表名称，用于提升特定词汇识别率"
            },
            {
              "_type": "Str",
              "show_name": "纠错表名",
              "real_name": "request.corpus.correct_table_name",
              "essential": 0,
              "info": {
                "hidden": true
              },
              "desc": "火山控制台上传的纠错表名称"
            },
            {
              "_type": "Str",
              "show_name": "语料上下文",
              "real_name": "request.corpus.context",
              "essential": 0,
              "info": {
                "hidden": true
              },
              "desc": "语料上下文信息，辅助模型理解领域术语"
            },
            {
              "_type": "Str",
              "show_name": "用户标识",
              "real_name": "user.uid",
              "essential": 0,
              "info": {
                "hidden": true
              },
              "desc": "火山侧的用户唯一标识，用于数据统计"
            }
          ],
          "output_info": [
            {
              "_type": "Str",
              "show_name": "任务 ID",
              "real_name": "TaskID"
            },
            {
              "_type": "Str",
              "show_name": "供应商任务 ID",
              "real_name": "id"
            },
            {
              "_type": "Str",
              "show_name": "识别文本",
              "real_name": "text"
            },
            {
              "_type": "Str",
              "show_name": "分句结果",
              "real_name": "utterances"
            },
            {
              "_type": "Int",
              "show_name": "音频时长（毫秒）",
              "real_name": "duration"
            }
          ],
          "condition": [],
          "hidden_params": [],
          "hidden_condition": [],
          "api_doc_params": [
            {
              "name": "audio.url",
              "type": "string",
              "required": true,
              "description": "公网可访问的音频 URL；内网 static/ 资源由 worker 自动转为 FP URL",
              "example": "https://example.com/audio.wav"
            },
            {
              "name": "audio.format",
              "type": "string",
              "required": false,
              "description": "音频格式：wav / mp3 / ogg / m4a / flac / opus / aac，默认 wav",
              "default": "wav",
              "example": "wav"
            },
            {
              "name": "audio.language",
              "type": "string",
              "required": false,
              "description": "音频语言代码（如 zh-CN、en-US），不传则由火山自动识别",
              "example": "zh-CN"
            },
            {
              "name": "audio.codec",
              "type": "string",
              "required": false,
              "description": "音频编码格式，如 raw、pcm",
              "example": "raw"
            },
            {
              "name": "audio.rate",
              "type": "integer",
              "required": false,
              "description": "音频采样率（Hz），如 16000、44100，不传由火山自动检测",
              "example": 16000
            },
            {
              "name": "audio.bits",
              "type": "integer",
              "required": false,
              "description": "音频位深度，如 8、16、24",
              "example": 16
            },
            {
              "name": "audio.channel",
              "type": "integer",
              "required": false,
              "description": "声道数，1（单声道）或 2（立体声）",
              "example": 1
            },
            {
              "name": "request.enable_itn",
              "type": "boolean",
              "required": false,
              "description": "是否启用文本规整（ITN），如\"二零二六\" -> \"2026\"，默认 true",
              "default": true,
              "example": true
            },
            {
              "name": "request.enable_punc",
              "type": "boolean",
              "required": false,
              "description": "是否在识别结果中添加标点符号，默认 true",
              "default": true,
              "example": true
            },
            {
              "name": "request.enable_speaker_info",
              "type": "boolean",
              "required": false,
              "description": "是否启用说话人分离，返回 speaker 字段，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.show_utterances",
              "type": "boolean",
              "required": false,
              "description": "是否返回逐句识别结果及字级时间戳，默认 true",
              "default": true,
              "example": true
            },
            {
              "name": "request.ssd_version",
              "type": "string",
              "required": false,
              "description": "语音识别模型版本，不传使用服务默认版本",
              "example": ""
            },
            {
              "name": "request.enable_ddc",
              "type": "boolean",
              "required": false,
              "description": "是否启用深度去噪（DDC），默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.enable_channel_split",
              "type": "boolean",
              "required": false,
              "description": "双声道音频时是否按声道分离后分别识别，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.show_speech_rate",
              "type": "boolean",
              "required": false,
              "description": "是否返回语速信息，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.show_volume",
              "type": "boolean",
              "required": false,
              "description": "是否返回音量信息，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.enable_auto_lang",
              "type": "boolean",
              "required": false,
              "description": "是否启用自动语言检测，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.enable_lid",
              "type": "boolean",
              "required": false,
              "description": "是否启用语种识别（LID），默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.enable_emotion_detection",
              "type": "boolean",
              "required": false,
              "description": "是否启用情绪检测，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.enable_gender_detection",
              "type": "boolean",
              "required": false,
              "description": "是否启用性别检测，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.vad_segment",
              "type": "boolean",
              "required": false,
              "description": "是否启用 VAD 将长音频切分为多个片段逐段识别，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.end_window_size",
              "type": "integer",
              "required": false,
              "description": "VAD 模式下静音判定窗口大小（毫秒），不传由模型自动决定",
              "example": 800
            },
            {
              "name": "request.sensitive_words_filter",
              "type": "string",
              "required": false,
              "description": "敏感词列表，匹配到的词将被替换为 * 号。不传不过滤",
              "example": ""
            },
            {
              "name": "request.enable_poi_fc",
              "type": "boolean",
              "required": false,
              "description": "是否启用 POI 识别，标注识别结果中的地点等信息，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.enable_music_fc",
              "type": "boolean",
              "required": false,
              "description": "是否启用音乐识别，检测音频中是否包含音乐，默认 false",
              "default": false,
              "example": false
            },
            {
              "name": "request.corpus.boosting_table_name",
              "type": "string",
              "required": false,
              "description": "火山控制台上传的热词表名称，用于提升特定词汇识别率",
              "example": "game_terms_v1"
            },
            {
              "name": "request.corpus.correct_table_name",
              "type": "string",
              "required": false,
              "description": "火山控制台上传的纠错表名称",
              "example": ""
            },
            {
              "name": "request.corpus.context",
              "type": "string",
              "required": false,
              "description": "语料上下文信息，辅助模型理解领域术语",
              "example": ""
            },
            {
              "name": "user.uid",
              "type": "string",
              "required": false,
              "description": "火山侧的用户唯一标识，用于数据统计",
              "example": ""
            }
          ]
        }
      }
    }
  },
  { upsert: true }
);
