import React from 'react';
import JSMpeg from '../jsmpeg';

export default class MpegVideoPlayer extends React.Component {
  componentDidMount() {
    const loc = document.location;
    this.player = new JSMpeg.Player(`ws://${loc.hostname}:${loc.port}/mpeg-ws-stream`, {
      canvas: this.canvas,
      videoBufferSize: 65536 * 1024,
      audioBufferSize: 2048 * 1024,
      maxAudioLag: 0.5,
    });
  }

  componentWillUnmount() {
    this.player.destroy();
  }

  render() {
    return <canvas ref={(c) => { this.canvas = c; }} />;
  }
}
