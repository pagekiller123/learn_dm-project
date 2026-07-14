// volcengine-seed-audio app 配置
// 来源: MongoDB tmax.dreamworker_apps (test 环境)
// 读取时间: 2026-07-12

db.dreamworker_apps.replaceOne(
  { name: "volcengine-seed-audio" },
  {
    "name": "volcengine-seed-audio",
    "display_name": "火山引擎音频生成",
    "desc": "基于火山引擎 seed-audio-1.0 模型，通过文本提示词生成音频，支持参考音频克隆音色",
    "cover": "https://dreammaker-test.netease.com/static/image/model_image/686a35d9cbca1174269edb3c6fcb3560",
    "status": 1,
    "demo_url": "",
    "sf_url": "",
    "deploy_type": "outer-cert",
    "type": "recommend",
    "creator": "grp.dreammaker",
    "app_url": "",
    "group_id": [],
    "create_time": 1783406862,
    "update_time": 1783564154,
    "is_top": 0,
    "env": "test",
    "api_open": true,
    "api_open_type": "model",
    "api_models": [
      "volcengine-seed-audio"
    ],
    "api_info": {
      "option_label": "音频生成能力",
      "alive_conf": {},
      "app_list": {
        "default": "volcengine-seed-audio",
        "items": [
          {
            "label": "音频生成",
            "children": [
              "volcengine-seed-audio"
            ],
            "auto_open": true
          }
        ]
      },
      "app_map": {
        "volcengine-seed-audio": {
          "sub_app_name": "volcengine-seed-audio",
          "show_name": "音频生成（seed-audio-1.0）",
          "source": "volc-seed-audio",
          "need_pay": 1,
          "preprocess": false,
          "postprocess": false,
          "max_image_size": 0,
          "model_field": "model",
          "params": [
            {
              "_type": "Str",
              "show_name": "模型",
              "real_name": "model",
              "essential": 0,
              "default": "seed-audio-1.0",
              "info": {
                "mini_conf": {
                  "diy_options": [
                    {
                      "label": "seed-audio-1.0",
                      "value": "seed-audio-1.0"
                    }
                  ]
                }
              },
              "hide": true
            },
            {
              "_type": "Str",
              "show_name": "提示词",
              "real_name": "text_prompt",
              "essential": 1,
              "placeholder": "请输入音频生成的提示词，最大支持2048字符",
              "info": {
                "mini_conf": {
                  "textarea": true
                }
              },
              "extra": "如需要参考音频生成：可通过 @音频N 引用参考音频中对应位置的音频参考资源；编号按上传顺序从 1 开始，即第一段参考音频为 @音频1，第二段为 @音频2，以此类推。"
            },
            {
              "_type": "FileSet",
              "show_name": "参考音频（最多 3 个）",
              "real_name": "references",
              "essential": 0,
              "resource_type": "input_url_set",
              "info": {
                "comp_mode": "audio",
                "upload_conf": {
                  "ext": "wav,mp3,pcm,ogg,opus",
                  "maxCount": 3,
                  "max_size": 10485760,
                  "_duration": {
                    "min": 0,
                    "max": 30
                  },
                  "_maxSize": 10485760,
                  "accept": ".wav,.mp3,.pcm,.ogg_opus"
                }
              },
              "placeholder": "支持wav/mp3格式，单个文件10MB以内，每条最长30秒。上传参考音频后不能同时上传参考图片",
              "extra": "每条参考音频最长30秒；与参考图片互斥，二选一"
            },
            {
              "_type": "Str",
              "show_name": "输出格式",
              "real_name": "audio_config.format",
              "essential": 0,
              "default": "mp3",
              "hide": true,
              "info": {
                "mini_conf": {
                  "diy_options": [
                    {
                      "label": "wav（无损，文件大）",
                      "value": "wav"
                    },
                    {
                      "label": "mp3（有损压缩，推荐）",
                      "value": "mp3"
                    },
                    {
                      "label": "ogg_opus（仅支持批量下载，Safari 无法播放）",
                      "value": "ogg_opus"
                    }
                  ],
                  "show_way": "select"
                }
              },
              "desc": "音频输出编码格式：wav（无损）、mp3（有损压缩）、ogg_opus（仅支持批量下载）"
            },
            {
              "_type": "Image",
              "resource_type": "input_to_file",
              "show_name": "参考图片（仅支持 1 张）",
              "real_name": "reference_image",
              "essential": 0,
              "info": {},
              "placeholder": "支持 jpeg/png/webp 格式，大小不超过 10MB",
              "extra": "上传参考图片后不能同时上传参考音频；与参考音频互斥，二选一"
            },
            {
              "_type": "Num",
              "show_name": "采样率",
              "real_name": "audio_config.sample_rate",
              "essential": 0,
              "default": 24000,
              "info": {
                "mini_conf": {
                  "diy_options": [
                    {
                      "label": "8000 Hz（低质量语音）",
                      "value": 8000
                    },
                    {
                      "label": "16000 Hz（标准语音）",
                      "value": 16000
                    },
                    {
                      "label": "24000 Hz（推荐）",
                      "value": 24000
                    },
                    {
                      "label": "32000 Hz（高清）",
                      "value": 32000
                    },
                    {
                      "label": "44100 Hz（CD 音质）",
                      "value": 44100
                    },
                    {
                      "label": "48000 Hz（专业音频）",
                      "value": 48000
                    }
                  ],
                  "show_way": "select"
                }
              },
              "desc": "音频采样率（Hz），数值越高音质越好、文件越大。常用：24000（推荐）、16000（语音）、48000（高保真）"
            },
            {
              "_type": "Num",
              "show_name": "语速（-50 ~ 100，0 为正常）",
              "real_name": "audio_config.speech_rate",
              "essential": 0,
              "default": 0,
              "info": {
                "mini_conf": {},
                "panel_max": 100,
                "panel_min": -50,
                "panel_step": 1
              },
              "desc": "语速调整，0 为正常语速，-50 为 0.5 倍速，100 为 2 倍速"
            },
            {
              "_type": "Num",
              "show_name": "音量（-50 ~ 100，0 为正常）",
              "real_name": "audio_config.loudness_rate",
              "essential": 0,
              "default": 0,
              "info": {
                "mini_conf": {},
                "panel_max": 100,
                "panel_min": -50,
                "panel_step": 1
              },
              "desc": "音量调整，0 为正常音量，-50 为 0.5 倍，100 为 2 倍"
            },
            {
              "_type": "Num",
              "show_name": "音调（-12 ~ 12 半音，0 为正常）",
              "real_name": "audio_config.pitch_rate",
              "essential": 0,
              "default": 0,
              "info": {
                "mini_conf": {},
                "panel_max": 12,
                "panel_min": -12,
                "panel_step": 1
              },
              "desc": "音调调整（半音），0 为正常，正数升高音调，负数降低音调"
            },
            {
              "_type": "Bool",
              "show_name": "启用字幕",
              "real_name": "audio_config.enable_subtitle",
              "essential": 0,
              "default": false,
              "desc": "开启后返回字级别时间戳字幕信息（可用于字幕对齐、卡拉 OK 效果等）",
              "info": {
                "hidden": true
              },
              "hide": true
            }
          ],
          "output_info": [
            {
              "_type": "File",
              "show_name": "生成音频",
              "real_name": "result",
              "info": {
                "comp_mode": "audio"
              }
            }
          ],
          "condition": [],
          "hidden_params": [],
          "hidden_condition": [],
          "api_doc_params": [
            {
              "name": "text_prompt",
              "type": "string",
              "required": true,
              "description": "音频生成提示词，最大 2048 字符。支持 @音频N 引用参考音频",
              "example": "早上好，今天天气不错。"
            },
            {
              "name": "audio_config.format",
              "type": "string",
              "required": false,
              "description": "输出格式：wav / mp3 / ogg_opus，默认 mp3；ogg_opus 仅支持下载，Safari 无法在线播放",
              "default": "mp3",
              "example": "mp3"
            },
            {
              "name": "audio_config.sample_rate",
              "type": "integer",
              "required": false,
              "description": "输出采样率，默认 24000",
              "default": 24000,
              "example": 24000
            },
            {
              "name": "audio_config.speech_rate",
              "type": "integer",
              "required": false,
              "description": "语速 [-50, 100]，0 为正常，100 为 2 倍速，-50 为 0.5 倍速",
              "default": 0,
              "example": 0
            },
            {
              "name": "audio_config.loudness_rate",
              "type": "integer",
              "required": false,
              "description": "音量 [-50, 100]，0 为正常，100 为 2 倍音量，-50 为 0.5 倍",
              "default": 0,
              "example": 0
            },
            {
              "name": "audio_config.pitch_rate",
              "type": "integer",
              "required": false,
              "description": "音调 [-12, 12]，0 为正常",
              "default": 0,
              "example": 0
            },
            {
              "name": "audio_config.enable_subtitle",
              "type": "boolean",
              "required": false,
              "description": "是否返回字级别时间戳",
              "default": false,
              "example": false
            },
            {
              "name": "references",
              "type": "array",
              "required": false,
              "description": "参考音频URL列表（最多3条）。支持wav/mp3格式，单个文件10MB以内，每条最长30秒。与 reference_image 互斥，二选一",
              "example": [
                "https://example.com/ref.wav"
              ]
            },
            {
              "name": "reference_image",
              "type": "string",
              "required": false,
              "description": "参考图片URL（仅支持1张）。支持jpeg/png/webp，大小不超过10MB。与 references 互斥，二选一",
              "example": "https://example.com/ref.png"
            }
          ]
        }
      }
    }
  },
  { upsert: true }
);
