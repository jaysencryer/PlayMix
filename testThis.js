const {
  default: MapsTransferWithinAStation,
} = require('material-ui/svg-icons/maps/transfer-within-a-station');

const authTest = {
  spotify: function () {
    console.log('doing spotify auth');
  },

  another: 'test',
};

function testBuilder() {
  return {
    useStreamer: function (streamer) {
      this.streamer = streamer;
      return this;
    },
    build: function () {
      return new testThing(this.streamer);
    },
  };
}

function testThing(streamer) {
  this.streamer = streamer;

  this.authTest = authTest[this.streamer];

  this.print = function () {
    console.log(this.output);
  };
}

const myTest = testBuilder().useStreamer('spotify').build();

myTest.print();
myTest.authTest();
