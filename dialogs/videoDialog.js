/*
*
*   Plugin developed by Dimitri Conejo
*   www.dimitriconejo.com
*
*/

CKEDITOR.dialog.add( 'videoDialog', function( editor ) {

    var lex = editor.plugins.videodetector.lex;

    //funcion para detectar el id y la plataforma (youtube, vimeo o dailymotion) de los videos
    var detector = function(embedCode) {

        var id, reproductor, url_comprobar;

        if (embedCode.indexOf('youtu.be') >= 0) {
            reproductor = 'youtube';
            id = embedCode.substring(embedCode.lastIndexOf("/")+1, embedCode.length);
        }

        if (embedCode.indexOf("youtube") >= 0) {
            reproductor = 'youtube';

            if (embedCode.indexOf("</iframe>") >= 0) {
                var fin = embedCode.substring(embedCode.indexOf("embed/")+6, embedCode.length);
                id  = fin.substring(fin.indexOf('"'), 0);
            } else {
                if (embedCode.indexOf("&") >= 0) {
                    id = embedCode.substring(embedCode.indexOf("?v=")+3, embedCode.indexOf("&"));
                } else {
                    id = embedCode.substring(embedCode.indexOf("?v=")+3, embedCode.length);
                }
            }
            url_comprobar = "https://gdata.youtube.com/feeds/api/videos/" + id + "?v=2&alt=json";
        }

        if (embedCode.indexOf("vimeo") >= 0){
            reproductor = 'vimeo';
            if (embedCode.indexOf("</iframe>") >= 0) {
                var fin = embedCode.substring(embedCode.lastIndexOf('vimeo.com/"')+6, embedCode.indexOf('>'));
                id = fin.substring(fin.lastIndexOf('/')+1, fin.indexOf('"',fin.lastIndexOf('/')+1))
            } else {
                id = embedCode.substring(embedCode.lastIndexOf("/")+1, embedCode.length)
            }
            url_comprobar = 'http://vimeo.com/api/v2/video/' + id + '.json';
        }

        if (embedCode.indexOf('dai.ly') >= 0) {
            reproductor = 'dailymotion';
            id = embedCode.substring(embedCode.lastIndexOf("/")+1, embedCode.length);
        }

        if (embedCode.indexOf("dailymotion") >= 0) {
            reproductor = 'dailymotion';
            if(embedCode.indexOf("</iframe>") >= 0) {
                var fin = embedCode.substring(embedCode.indexOf('dailymotion.com/')+16, embedCode.indexOf('></iframe>'));
                id = fin.substring(fin.lastIndexOf('/')+1, fin.lastIndexOf('"'))
            } else {
                if (embedCode.indexOf('_') >= 0) {
                    id = embedCode.substring(embedCode.lastIndexOf('/')+1, embedCode.indexOf('_'));
                } else {
                    id = embedCode.substring(embedCode.lastIndexOf('/')+1, embedCode.length);
                }
            }
            url_comprobar = 'https://api.dailymotion.com/video/' + id;
        }

        return {
            id: id,
            reproductor:reproductor,
            url_comprobar: url_comprobar,
        };
    };

    var getVideoSrc = function (embedCode) {

        var src,
            respuesta = detector(embedCode);

        switch (respuesta.reproductor) {
            case 'youtube':
                src = "https://www.youtube.com/embed/"+respuesta.id+"?autohide=1&controls=1&showinfo=0";
                break;
            case 'vimeo':
                src = "https://player.vimeo.com/video/"+respuesta.id+"?portrait=0";
                break;
            case 'dailymotion':
                src = "https://www.dailymotion.com/embed/video/"+respuesta.id;
                break;
        }

        return src;
    };

    return {
        title: lex('insert'),
        minWidth: 400,
        minHeight: 100,
        contents: [
            {
                id: 'vd-base-tab',
                label: 'Basic Settings',
                elements: [
                    {
                        type: 'text',
                        id: 'embed_code',
                        label: lex('embed_code'),
                        validate: CKEDITOR.dialog.validate.notEmpty(lex('embed_code_validate_error')),
                        setup: function(iframe, block) {
                            var src = iframe.getAttribute('src') || '';
                            this.setValue(src);
                            this.oldSrc = src;
                        },
                        commit: function(iframe, block) {
                            var value = this.getValue(),
                                oldSrc = this.oldSrc,
                                src = value == oldSrc ? oldSrc : getVideoSrc(value);
                            iframe.setAttribute('src', src);
                        }
                    },
                    {
                        type: 'hbox',
                        widths: [ '50%', '50%' ],
                        children: [
                            {
                                type: 'text',
                                id: 'width',
                                label: lex('width'),
                                setup: function(iframe, block) {
                                    var width = iframe.getAttribute('width') || '100%';
                                    this.setValue(width);
                                },
                                commit: function(iframe, block) {
                                    iframe.setAttribute('width', this.getValue());
                                }
                            },
                            {
                                type: 'text',
                                id: 'height',
                                label: lex('height'),
                                setup: function(iframe, block) {
                                    var height = iframe.getAttribute('height') || '400';
                                    this.setValue(height);
                                },
                                commit: function(iframe, block) {
                                    iframe.setAttribute('height', this.getValue());
                                }
                            }
                        ]
                    },
                    {
                        type: 'hbox',
                        id: 'alignment',
                        children: [
                            {
                                id: 'align',
                                type: 'radio',
                                items: [
                                    [ lex('alignNone'), 'none' ],
                                    [ lex('alignLeft'), 'left' ],
                                    [ lex('alignCenter'), 'center' ],
                                    [ lex('alignRight'), 'right' ]
                                ],
                                label: lex('align'),
                                setup: function(iframe, block) {
                                    var align = block.getAttribute('data-align') || 'center';
                                    this.setValue(align);
                                },
                                commit: function(iframe, block) {
                                    var align = this.getValue(),
                                        oldAlign = block.getAttribute('data-align');

                                    if (oldAlign) {
                                        block.removeClass('videodetector_' + oldAlign);
                                    }

                                    block.setAttribute('data-align', align);
                                    block.addClass('videodetector_' + align);
                                }
                            }
                        ]
                    }
                ]
            }
        ],

        onShow: function() {
            var selection = editor.getSelection(),
                block = selection.getStartElement(),
                iframe;

            if (block) {
                iframe = block.findOne('>iframe');
            }

            if (!iframe) {
                block = editor.document.createElement('div');
                block.setAttribute('class', 'videodetector');

                iframe = editor.document.createElement('iframe');
                iframe.setAttribute('frameborder', '0');
                block.append(iframe);

                this.insertMode = true;
            } else {
                this.insertMode = false;
            }

            this.iframe = iframe;
            this.block = block;

            this.setupContent(this.iframe, this.block);
        },

        onOk: function() {
            var iframe = this.iframe,
                block = this.block;

            this.commitContent(iframe, block);

            if (this.insertMode) {
                editor.insertElement(block);
            }

        }
    };
});