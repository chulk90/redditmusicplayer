var API, Authentication, BandcampPlayer, Button, Buttons, CommentsView, CurrentSongView, CustomSubreddit, FLAG_DEBUG, KeyboardController, MP3Player, MobileUI, MusicPlayer, NotALink, NotASong, PlayerController, Playlist, PlaylistView, ProgressBar, ProgressBarView, Reddit, Remote, RemoteView, Search, SearchView, Song, SongBandcamp, SongMP3, SongSoundcloud, SongVimeo, SongYoutube, SortMethodView, SoundcloudPlayer, Subreddit, SubredditPlayListView, SubredditPlaylist, SubredditSelectionView, Templates, UIModel, VimeoPlayer, VolumeControl, VolumeControlView, YoutubePlayer, firstRequest, onYouTubeIframeAPIReady, timeSince;

window.RMP = {};

RMP.dispatcher = _.clone(Backbone.Events);

$(document).ready(function() {
  var blu, grn, red, rst, wht, ylw;
  RMP.dispatcher.trigger("app:main");
  RMP.dispatcher.trigger("app:resize");
  wht = '\033[1;37m';
  blu = '\033[1;34m';
  ylw = '\033[1;33m';
  grn = '\033[1;32m';
  red = '\033[1;31m';
  rst = '\033[0m';
  return console.log("  __                 #               #                  \n |--|   ### # #  ##     ###     ###  #   ## # # ### ### \n |  |   ### # #  #   #  #       # #  #  # # ### ##  #   \n() ()   # # ### ##   ## ###     ###  ## ###   # ### #   \n                                #           ###         ");
});

$(window).resize(function() {
  return RMP.dispatcher.trigger("app:resize");
});

RMP.dragging = false;

$(window).mouseup(function() {
  RMP.dragging = false;
  return RMP.dispatcher.trigger("events:stopDragging");
});

API = {
  Bandcamp: {
    base: "//api.bandcamp.com/api",
    key: "vatnajokull"
  },
  Soundcloud: {
    base: "//api.soundcloud.com",
    key: "5441b373256bae7895d803c7c23e59d9"
  },
  Reddit: {
    base: "//www.reddit.com"
  },
  MusicPlayer: {
    base: "https://reddit.music.player.il.ly"
  }
};

FLAG_DEBUG = false;

if (localStorage.debug && localStorage.debug === "true") {
  FLAG_DEBUG = true;
}

Templates = {
  SubredditPlayListView: _.template("<a class='item' data-category='<%= category %>' data-value='<%= name %>'><%= text %></a>"),
  SubredditCurrentPlayListView: _.template("<a class='item' data-category='<%= category %>' data-value='<%= name %>'> <%= text %> </a>"),
  PlayListView: _.template("<div class='ui item' data-id='<%= id %>'> <% if (thumbnail) { %> <% if (thumbnail == 'self' || thumbnail == 'default') { %> <% if (type == 'mp3') { %> <i class='left floated icon music large thumbnail'/> <% } else { %> <i class='left floated icon chat outline large thumbnail'/> <% } %> <% } else if (thumbnail == 'nsfw' ){%> <i class='left floated icon spy large thumbnail'/> <% } else {%> <img src='<%= thumbnail %>' class='ui image tiny rounded left floated thumbnail'/> <% } %> <% } %> <div class='content'> <div class='title'><%= title %></div> <span class='ups'><%= ups %></span> • <span class='author'><%= author %></span> in <span class='subreddit'><%= subreddit %></span> • <span class='created'><%= created_ago %></span> • <span class='origin'><%= domain %></span> <% if (num_comments > 0) { %> • <span class='comments'><%= num_comments %> <i class='icon small chat'></i></span> <% } %> </div> </div>"),
  CurrentSongView: _.template("<% if (media) { %> <% if (url.indexOf('youtu') == -1) { %> <img class='ui image fluid' src='<%= media.oembed.thumbnail_url %>' /> <% } %> <% } %> <% if (url.indexOf('imgur') >= 0) { %> <a class='ui image fluid' href='<%= url %>' target='_blank'> <img src='<%= url %>' /> </a> <% } %> <div class='vote' id='<%= name %>'> <div class='upvote'><i class='icon up arrow'></i></div> <div class='downvote'><i class='icon down arrow'></i></div> </div> <h3 class='ui header title'><%= title %></h3> <table class='ui table inverted compact striped'> <tbody> <% if (media) { %> <tr> <td>Title</td> <td><%= media.oembed.title %></td> </tr> <tr> <td>Description</td> <td><%= media.oembed.description %></td> </tr> <% } %> <tr> <td class='four wide'>Karma</td> <td class='thirteen wide'><%= ups %></td> </tr><tr> <td>Author</td> <td><%= author %></td> </tr><tr> <td>Timestamp</td> <td><%= subreddit %></td> </tr><tr> <td>Subreddit</td> <td><%= created_ago %> ago</td> </tr><tr> <td>Origin</td> <td><%= domain %></td> </tr><tr> <td>Comments</td> <td><%= num_comments %> comments</td> </tr><tr> <td colspan='2'> <div class='ui 2 fluid tiny buttons'> <a target='_blank' class='permalink ui gold button' href='http://www.reddit.com<%= permalink %>'> <i class='url icon'></i> Permalink </a> <% if (type == 'link') { %> <a target='_blank' class='ui gold external button' href='<%= url %>'> <i class='external url icon'></i> External Link </a> <% } %> <% if (media) { %> <% if (media && (media.type == 'youtube.com' || media.type == 'youtu.be')) { %> <script src='https://apis.google.com/js/platform.js'></script> <div class='ui youtube tiny button'> <div class='g-ytsubscribe' data-channel='<%= media.oembed.author_name %>' data-layout='default' data-theme='dark' data-count='default'></div> </div> <% } else if (media.type == 'soundcloud.com') { %> <a href='<%= media.oembed.author_url %>' target='_blank' class='ui soundcloud button'> <i class='icon male'></i> <%= media.oembed.author_name %> </a> <% } else if (media.type == 'vimeo.com') { %> <a href='<%= media.oembed.author_url %>' target='_blank' class='ui soundcloud button'> <i class='icon male'></i> <%= media.oembed.author_name %> </a> <% } %> <% } %> </div> </td> </tr> </tbody> </table> <% if (is_self) { %> <div class='ui divider'></div> <div class='self text'> <%= selftext_html %> </div> <% } %>"),
  CommentsView: _.template("<div class='comment' id='<%= name %>' data-ups='<%= ups %>' data-downs='<%= downs %>'> <div class='vote'> <div class='upvote<% if (likes === true) print(' active') %>'><i class='icon up arrow'></i></div> <div class='downvote<% if (likes === false) print(' active') %>'><i class='icon down arrow'></i></div> </div> <div class='content'> <a class='author'><%= author %></a> <div class='metadata'> <span class='ups'><%= ups %></span>/ <span class='downs'><%= downs %></span> <span class='date'><%= created_ago %> ago</span> </div> <div class='text'><% print(_.unescape(body_html)) %></div> <div class='actions'><a class='reply'>Reply</a></div> </div> </div>"),
  ReplyTo: _.template("<span class='ui reply_to label inverted black fluid' id='<%= id %>'> Replying to <%= author %> <i class='icon close'></i> </span>"),
  AuthenticationView: _.template("<div class='item ui dropdown reddit account' id='<%= id %>'> <i class='icon user'></i> <%= name %> <i class='icon dropdown'></i> <div class='menu'> <div class='item'> <%= link_karma %> Link Karma </div> <div class='item'> <%= comment_karma %> Comment Karma </div> <% if (is_gold == true) { %> <div class='item'> Gold Member </div> <% } %> <a class='item sign-out' href='/logout'> <i class='icon off'></i> Log Out </a> </div> </div>")
};

firstRequest = true;

Reddit = Backbone.Model.extend({
  defaults: {
    sortMethod: "hot",
    topMethod: "month"
  },
  vote: function(id, dir) {
    var data;
    data = {
      id: id,
      dir: dir
    };
    return $.ajax({
      type: 'POST',
      dataType: "json",
      url: "/api/vote",
      data: data,
      success: (function(_this) {
        return function(resp) {
          if (FLAG_DEBUG) {
            return console.log(resp);
          }
        };
      })(this)
    });
  },
  subreddits: function() {
    if (RMP.subredditplaylist.length === 0) {
      return "listentothis";
    } else {
      return RMP.subredditplaylist.toString();
    }
  },
  getMusic: function(callback, after) {
    var data, subs;
    data = {};
    data.sort = this.get("sortMethod");
    if (this.get("sortMethod") === "top") {
      data.t = this.get("topMethod");
    }
    if (after != null) {
      data.after = after;
    }
    if (RMP.search != null) {
      return this.getSearch(callback, data);
    }
    if (RMP.multi != null) {
      return this.getMulti(callback, data);
    }
    subs = this.subreddits();
    if (subs === null) {
      return;
    }
    if (FLAG_DEBUG) {
      console.log("Reddit :: GetMusic :: ", subs);
    }
    if (firstRequest) {
      $.ajax({
        dataType: "json",
        url: "/api/get/r/" + subs + "/" + (this.get('sortMethod')) + ".json?jsonp=?",
        data: data,
        success: (function(_this) {
          return function(r) {
            if (r.error != null) {
              return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
            }
            return callback(r.data.children);
          };
        })(this)
      });
      return firstRequest = false;
    } else {
      return $.ajax({
        dataType: "json",
        url: API.Reddit.base + "/r/" + subs + "/" + (this.get('sortMethod')) + ".json?jsonp=?",
        data: data,
        success: (function(_this) {
          return function(r) {
            if (r.error != null) {
              return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
            }
            return callback(r.data.children);
          };
        })(this)
      });
    }
  },
  getSearch: function(callback, data) {
    this.set("search", RMP.search);
    if (FLAG_DEBUG) {
      console.log("Reddit :: GetSearch ::", this.get("search"));
    }
    return $.ajax({
      dataType: "json",
      url: API.Reddit.base + "/search.json?q=" + (this.get('search')) + "&jsonp=?",
      data: data,
      success: (function(_this) {
        return function(r) {
          if (r.error != null) {
            return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
          }
          return callback(r.data.children);
        };
      })(this)
    });
  },
  getMulti: function(callback, data) {
    if (!this.has("multi")) {
      this.set("multi", RMP.multi);
    }
    if (FLAG_DEBUG) {
      console.log("Reddit :: GetMulti ::", this.get("multi"));
    }
    return $.ajax({
      dataType: "json",
      url: API.Reddit.base + "/user/" + (this.get('multi')) + "/" + (this.get('sortMethod')) + ".json?jsonp=?",
      data: data,
      success: (function(_this) {
        return function(r) {
          if (r.error != null) {
            return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
          }
          return callback(r.data.children);
        };
      })(this)
    });
  },
  getMore: function(last, callback) {
    return this.getMusic(callback, last);
  },
  getComments: function(permalink, callback) {
    var data, url;
    data = {};
    data.sort = this.get("sortMethod");
    if (this.get("sortMethod") === "top") {
      data.t = this.get("topMethod");
    }
    url = "" + API.Reddit.base + permalink + ".json?jsonp=?";
    if (RMP.authentication != null) {
      url = "/api/comments";
    }
    if (RMP.authentication != null) {
      data.permalink = permalink;
    }
    return $.ajax({
      dataType: "json",
      url: url,
      data: data,
      success: (function(_this) {
        return function(r) {
          if (r.error != null) {
            return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
          }
          return callback(r[1].data.children);
        };
      })(this)
    });
  },
  addComment: function(params) {
    var data;
    data = {
      text: params.text,
      thing_id: params.thing_id
    };
    return $.ajax({
      type: 'POST',
      dataType: "json",
      url: "/api/add_comment",
      data: data,
      success: (function(_this) {
        return function(r) {
          if (r.error != null) {
            return console.error("Reddit :: " + r.error.type + " :: " + r.error.message);
          }
          return params.callback(r);
        };
      })(this)
    });
  },
  changeSortMethod: function(sortMethod, topMethod) {
    this.set("sortMethod", sortMethod);
    return this.set("topMethod", topMethod);
  },
  save: function() {
    var e;
    try {
      localStorage["sortMethod"] = this.get("sortMethod");
      return localStorage["topMethod"] = this.get("topMethod");
    } catch (_error) {
      e = _error;
      return console.error(e);
    }
  },
  initialize: function() {
    if (localStorage["sortMethod"] != null) {
      this.set("sortMethod", localStorage["sortMethod"]);
    }
    if (localStorage["topMethod"] != null) {
      this.set("topMethod", localStorage["topMethod"]);
    }
    if (!(this.get("sortMethod") === "top" || this.get("sortMethod") === "hot" || this.get("sortMethod") === "new")) {
      this.changeSortMethod("hot", "week");
      this.save();
    }
    return this.listenTo(this, "change", this.save);
  }
});

RMP.reddit = new Reddit;

Authentication = Backbone.Model.extend({
  template: Templates.AuthenticationView,
  initialize: function() {
    this.$el = $(".titlebar .authentication");
    this.$ = function(selector) {
      return $(".titlebar .authentication " + selector);
    };
    if (this.get("name")) {
      this.$el.html(this.template(this.attributes));
      this.$(".ui.dropdown").dropdown();
    }
    return RMP.dispatcher.trigger("authenticated", this);
  }
});

RMP.dispatcher.on("app:page", function(category, page) {
  if (RMP.authentication != null) {
    return $(".titlebar .authentication .sign-out").attr("href", "/logout?redirect=/" + page);
  } else {
    return $(".titlebar .authentication .log-in").attr("href", "/login?redirect=/" + page);
  }
});

ProgressBar = Backbone.Model.extend({
  defaults: {
    loaded: 0,
    current: 0,
    duration: 60,
    currentSongID: -1
  },
  setDuration: function(data) {
    this.set("duration", data);
    return this.set("current", 0);
  },
  setLoaded: function(data) {
    return this.set("loaded", data);
  },
  setCurrent: function(data) {
    return this.set("current", data);
  },
  change: function(index, song) {
    if (song.get("id") !== this.get("currentSongID") && song.get("playable") === true) {
      this.setCurrent(0);
      this.setLoaded(0);
      this.setDuration(60);
      this.set("currentSongID", song.get("id"));
      return $(".controls .progress").removeClass("soundcloud");
    }
  },
  enableSoundcloud: function(waveform) {
    $(".controls .progress").addClass("soundcloud");
    return $(".controls .progress .waveform").css("-webkit-mask-box-image", "url(" + waveform + ")");
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      console.log("ProgressBar :: Ready");
    }
    this.listenTo(RMP.dispatcher, "song:change", this.change);
    this.listenTo(RMP.dispatcher, "progress:current", this.setCurrent);
    this.listenTo(RMP.dispatcher, "progress:loaded", this.setLoaded);
    return this.listenTo(RMP.dispatcher, "progress:duration", this.setDuration);
  }
});

ProgressBarView = Backbone.View.extend({
  events: {
    "mousemove .progress": "seeking",
    "mousedown .progress": "startSeeking"
  },
  justSeeked: false,
  startSeeking: function(e) {
    var offset;
    RMP.dragging = true;
    offset = e.offsetX || e.layerX || e.originalEvent.layerX || 0;
    this.percentage = offset / this.$(".progress").outerWidth();
    return this.justSeeked = true;
  },
  seeking: function(e) {
    var offset;
    if (!this.justSeeked) {
      return;
    }
    offset = e.offsetX || e.layerX || e.originalEvent.layerX || 0;
    this.percentage = offset / this.$(".progress").outerWidth();
    if (RMP.dragging) {
      RMP.dispatcher.trigger("progress:set", this.percentage, !RMP.dragging);
    }
    return this.$(".progress .current").css("width", this.percentage * 100 + "%");
  },
  stopSeeking: function() {
    if (!this.justSeeked) {
      return;
    }
    RMP.dispatcher.trigger("progress:set", this.percentage, !RMP.dragging);
    if (FLAG_DEBUG && RMP.dragging === false) {
      console.log("ProgressBarView :: Seek :: " + (this.percentage * 100) + "%");
    }
    return this.justSeeked = false;
  },
  toMinSecs: function(secs) {
    var hours, mins;
    hours = Math.floor(secs / 3600);
    if (hours) {
      mins = Math.floor((secs / 60) - hours * 60);
      secs = Math.floor(secs % 60);
      return (String('0' + hours).slice(-2)) + ":" + (String('0' + mins).slice(-2)) + ":" + (String('0' + secs).slice(-2));
    } else {
      mins = Math.floor(secs / 60);
      secs = Math.floor(secs % 60);
      return (String('0' + mins).slice(-2)) + ":" + (String('0' + secs).slice(-2));
    }
  },
  resize: function() {
    var itemWidth;
    itemWidth = $(".controls .left .item").outerWidth();
    return this.$(".progress").css("width", $("body").innerWidth() - itemWidth * 7.5);
  },
  render: function() {
    this.$(".end.time").text(this.toMinSecs(this.model.get("duration")));
    this.$(".progress .loaded").css("width", this.model.get("loaded") * 100 + "%");
    this.$(".start.time").text(this.toMinSecs(this.model.get("current")));
    return this.$(".progress .current").css("width", this.model.get("current") / this.model.get("duration") * 100 + "%");
  },
  initialize: function() {
    this.resize();
    if (FLAG_DEBUG) {
      console.log("ProgressBarView :: Ready");
    }
    this.listenTo(this.model, "change", this.render);
    this.listenTo(RMP.dispatcher, "app:resize", this.resize);
    return this.listenTo(RMP.dispatcher, "events:stopDragging", this.stopSeeking);
  }
});

RMP.progressbar = new ProgressBar;

RMP.progressbarview = new ProgressBarView({
  el: $(".controls .middle.menu"),
  model: RMP.progressbar
});

Button = Backbone.View.extend({
  events: {
    "click": "click"
  },
  click: function(e) {
    return RMP.dispatcher.trigger(this.attributes.clickEvent, e);
  },
  stateChange: function(data) {
    if (FLAG_DEBUG) {
      console.log("Button :: StateChange", data);
    }
    if (this.checkState(data) === true) {
      return this.$el.addClass("active");
    } else {
      return this.$el.removeClass("active");
    }
  },
  initialize: function() {
    this.checkState = this.attributes.checkState;
    if (this.attributes.listenEvent != null) {
      return this.listenTo(RMP.dispatcher, this.attributes.listenEvent, this.stateChange);
    }
  }
});

Buttons = Backbone.Model.extend({
  initialize: function() {
    this.backward = new Button({
      el: $(".controls .backward.button"),
      attributes: {
        clickEvent: "controls:backward"
      }
    });
    this.forward = new Button({
      el: $(".controls .forward.button"),
      attributes: {
        clickEvent: "controls:forward"
      }
    });
    return this.play = new Button({
      el: $(".controls .play.button"),
      attributes: {
        clickEvent: "controls:play",
        listenEvent: "player:playing player:paused player:ended",
        checkState: function(player) {
          if (player === window) {
            player = RMP.player.controller;
          }
          if (player.type === "youtube") {
            return player.player.getPlayerState() === 1;
          } else {
            return player.playerState === "playing";
          }
        }
      }
    });
  }
});

VolumeControl = Backbone.Model.extend({
  defaults: {
    volume: 1,
    size: 100
  },
  volumeChange: function() {
    var e;
    RMP.dispatcher.trigger("controls:volume", this.get("volume"));
    try {
      return localStorage["volume"] = this.get("volume");
    } catch (_error) {
      e = _error;
      return console.error(e);
    }
  },
  initialize: function() {
    this.listenTo(this, "change:volume", this.volumeChange);
    if (localStorage["volume"] != null) {
      return this.set("volume", localStorage["volume"]);
    }
  }
});

VolumeControlView = Backbone.View.extend({
  events: {
    "click .volume-control": "click"
  },
  click: function(e) {
    var current, max, offset, ratio;
    max = this.model.get("size");
    offset = e.offsetY || e.layerY || e.originalEvent.layerY || 0;
    current = (offset - max) * -1;
    console.log(offset, current);
    ratio = current / max;
    return this.model.set("volume", ratio);
  },
  render: function() {
    this.$(".volume-bar").css("height", (this.model.get("volume") * this.model.get("size")) + "px");
    if (this.model.get("volume") >= 0.5) {
      return this.$(".icon.volume").removeClass("off up down").addClass("up");
    } else if (this.model.get("volume") <= 0.1) {
      return this.$(".icon.volume").removeClass("off up down").addClass("off");
    } else {
      return this.$(".icon.volume").removeClass("off up down").addClass("down");
    }
  },
  initialize: function() {
    this.listenTo(this.model, "change:volume", this.render);
    return this.render();
  }
});

RMP.volumecontrol = new VolumeControlView({
  model: new VolumeControl,
  el: $(".controls .volume.button")
});

RMP.buttons = new Buttons;

UIModel = Backbone.View.extend({
  tagName: "div",
  className: "container",
  cache: {},
  events: {
    "click .switcher .item": "open"
  },
  open: function(e) {
    var item, page;
    item = $(e.currentTarget);
    page = item.data("page");
    this.navigate(page);
    return RMP.mobileui.changeText(this.number, page);
  },
  load: function(page, callback, ignoreCache) {
    if (page in this.cache && (ignoreCache === false || (ignoreCache == null))) {
      return callback(this.cache[page]);
    }
    if (FLAG_DEBUG) {
      console.log("UI :: Load :: ", page);
    }
    return $.get("/" + page, (function(_this) {
      return function(data) {
        _this.cache[page] = data;
        return callback(data);
      };
    })(this));
  },
  navigate: function(page) {
    this.page = page;
    return this.load(page, (function(_this) {
      return function(data) {
        return _this.render(data, page);
      };
    })(this));
  },
  getElement: function(page) {
    return this.$("[data-page=" + page + "]");
  },
  render: function(data, page) {
    this.$el.html(data.content);
    this.$el.find(".ui.dropdown").dropdown();
    this.$el.find(".ui.checkbox").checkbox();
    return RMP.dispatcher.trigger("loaded:" + page);
  },
  setCurrent: function(index, song) {
    var offset;
    if (!this.$el.find(".content").hasClass("playlist")) {
      return;
    }
    offset = this.$(".music.playlist .item")[RMP.playlist.current.index].offsetTop;
    return this.$el.scrollTop(offset);
  },
  initialize: function() {
    this.number = (function() {
      switch (false) {
        case !this.$el.hasClass("one"):
          return "one";
        case !this.$el.hasClass("two"):
          return "two";
        case !this.$el.hasClass("three"):
          return "three";
      }
    }).call(this);
    $(".ui.dropdown").dropdown();
    $(".ui.checkbox").checkbox();
    this.listenTo(RMP.dispatcher, "app:page", this.navigate);
    if (FLAG_DEBUG) {
      console.log("UI :: Ready");
    }
    return this.listenTo(RMP.dispatcher, "song:change", this.setCurrent);
  }
});

RMP.ui = [
  new UIModel({
    el: $(".ui.container.one")
  }), new UIModel({
    el: $(".ui.container.two")
  }), new UIModel({
    el: $(".ui.container.three")
  })
];

MobileUI = Backbone.View.extend({
  tagName: "div",
  className: "mobilebar",
  events: {
    "click .item": "click"
  },
  changeText: function(item, text) {
    return this.$(".item." + item).text(text);
  },
  click: function(e) {
    var container, item, page;
    item = $(e.currentTarget);
    page = item.data("page");
    container = $(".ui.container[data-page=" + page + "]");
    $(".ui.container").removeClass("active");
    container.addClass("active");
    this.$(".item").removeClass("active");
    return item.addClass("active");
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      return console.log("MobileUI :: Ready");
    }
  }
});

RMP.mobileui = new MobileUI({
  el: $(".ui.mobilebar")
});

RMP.dispatcher.on("app:main", function() {
  return $(".ui.container").each(function(i, el) {
    var item;
    item = $(el);
    return RMP.dispatcher.trigger("loaded:" + (item.data('page')));
  });
});

Subreddit = Backbone.Model.extend({
  defaults: {
    category: null,
    name: null,
    text: null
  },
  idAttribute: "name",
  toString: function() {
    return this.escape("name");
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      return console.log("Subreddit :: Created");
    }
  }
});

SubredditPlaylist = Backbone.Collection.extend({
  model: Subreddit,
  localStorage: new Backbone.LocalStorage("Subreddits"),
  toString: function() {
    return this.toArray().join("+");
  },
  toArray: function() {
    return this.pluck("name").filter(function(x) {
      return x;
    });
  },
  parseFromRemote: function(strSubs) {
    var i, j, len, ref, sub, subs;
    subs = [];
    ref = strSubs.split("+");
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      sub = new Subreddit({
        category: "remote",
        name: i,
        text: i
      });
      subs.push(sub);
    }
    return this.reset(subs);
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      console.log("SubredditPlaylist :: Ready");
    }
    this.listenTo(this, "remove", function(x) {
      return x.destroy();
    });
    return this.listenTo(RMP.dispatcher, "remote:subreddits", this.parseFromRemote);
  }
});

SubredditPlayListView = Backbone.View.extend({
  tagName: "div",
  className: "selection",
  events: {
    "click .menu.selection .item": "remove"
  },
  remove: function(e) {
    var currentReddit;
    currentReddit = e.currentTarget.dataset.value;
    if (FLAG_DEBUG) {
      console.log("SubredditPlayListView :: Remove :: ", currentReddit);
    }
    if (e.currentTarget.dataset.category === "multi") {
      RMP.multi = null;
      RMP.playlist.refresh();
      return this.render();
    } else if (e.currentTarget.dataset.category === "search") {
      RMP.search = null;
      RMP.playlist.refresh();
      return this.render();
    } else {
      return RMP.subredditplaylist.remove(RMP.subredditplaylist.get(currentReddit));
    }
  },
  template: Templates.SubredditCurrentPlayListView,
  render: function() {
    var sub;
    this.$(".menu.selection").html("");
    if (RMP.search != null) {
      sub = new Subreddit({
        category: "search",
        name: "search: " + (RMP.search.get('text')),
        text: "search: " + (RMP.search.get('text'))
      });
      return this.$(".menu.selection").append(this.template(sub.toJSON()));
    } else if (RMP.multi) {
      sub = new Subreddit({
        category: "multi",
        name: RMP.multi,
        text: RMP.multi
      });
      return this.$(".menu.selection").append(this.template(sub.toJSON()));
    } else {
      return RMP.subredditplaylist.each((function(_this) {
        return function(model) {
          return _this.$(".menu.selection").append(_this.template(model.toJSON()));
        };
      })(this));
    }
  },
  initialize: function() {
    this.listenTo(RMP.subredditplaylist, "add", this.render);
    this.listenTo(RMP.subredditplaylist, "remove", this.render);
    this.listenTo(RMP.subredditplaylist, "reset", this.render);
    if (FLAG_DEBUG) {
      return console.log("SubredditPlayListView :: Ready");
    }
  }
});

SubredditSelectionView = Backbone.View.extend({
  tagName: "div",
  className: "selection",
  events: {
    "click .menu.selection .item": "open"
  },
  open: function(e) {
    var currentReddit, target;
    target = $(e.currentTarget);
    currentReddit = new Subreddit({
      category: this.category,
      name: target.data("value"),
      text: target.text()
    });
    if (target.hasClass("active")) {
      RMP.subredditplaylist.get(currentReddit).destroy();
      RMP.subredditplaylist.remove(currentReddit);
    } else {
      RMP.subredditplaylist.add(currentReddit);
      RMP.subredditplaylist.get(currentReddit).save();
    }
    if (FLAG_DEBUG) {
      console.log("Subreddit :: Changed :: " + currentReddit);
    }
    return this.render();
  },
  category: "Default",
  reddits: [],
  render: function() {
    var redditsInThisCategory, redditsInThisCategoryByName;
    this.show();
    redditsInThisCategory = RMP.subredditplaylist.where({
      "category": this.category
    });
    if (redditsInThisCategory === 0) {
      return;
    }
    redditsInThisCategoryByName = _.pluck(_.pluck(redditsInThisCategory, "attributes"), "name");
    this.activeReddits = _.intersection(redditsInThisCategoryByName, this.reddits);
    this.$(".menu .item").removeClass("active");
    return _.each(this.activeReddits, (function(_this) {
      return function(element) {
        return _this.$(".menu .item[data-value='" + element + "']").addClass("active");
      };
    })(this));
  },
  hide: function() {
    return this.$el.hide();
  },
  hideAllExcept: function(value) {
    var subsList;
    subsList = _.filter(this.reddits, function(r) {
      return !_.startsWith(r, value);
    });
    return _.each(subsList, (function(_this) {
      return function(element) {
        return _this.$(".menu .item[data-value='" + element + "']").hide();
      };
    })(this));
  },
  show: function() {
    this.$el.show();
    return this.$(".menu .item").show();
  },
  initialize: function() {
    this.category = this.$el.data("category");
    this.reddits = $.map(this.$(".selection.menu .item"), function(o) {
      return $(o).data("value");
    });
    this.render();
    this.listenTo(RMP.subredditplaylist, "add", this.render);
    this.listenTo(RMP.subredditplaylist, "remove", this.render);
    this.listenTo(RMP.subredditplaylist, "reset", this.render);
    if (FLAG_DEBUG) {
      return console.log("SubredditSelectionView :: View Made", this.category);
    }
  }
});

CustomSubreddit = Backbone.View.extend({
  events: {
    "keyup input": "keypress",
    "click .button": "submit"
  },
  keypress: function(e) {
    var hiddenList, showList, val;
    if (e.keyCode === 13) {
      return this.submit();
    } else {
      val = this.$("input").val();
      if ((val == null) || val.trim().length === 0) {
        _.forEach(RMP.subredditsSelection, function(s) {
          return s.show();
        });
        return;
      }
      val = val.toLowerCase();
      hiddenList = _.filter(RMP.subredditsSelection, function(s) {
        return !_.find(s.reddits, function(r) {
          return _.startsWith(r, val);
        });
      });
      _.forEach(hiddenList, function(list) {
        return list.hide();
      });
      showList = _.filter(RMP.subredditsSelection, function(s) {
        return _.find(s.reddits, function(r) {
          return _.startsWith(r, val);
        });
      });
      return _.forEach(showList, function(list) {
        return list.hideAllExcept(val);
      });
    }
  },
  submit: function() {
    var sub, val;
    _.forEach(RMP.subredditsSelection, function(s) {
      return s.show();
    });
    val = this.$("input").val();
    if (val == null) {
      return;
    }
    if (val.trim().length < 3) {
      return;
    }
    val = val.toLowerCase();
    if (RMP.subredditplaylist.where({
      name: val
    }).length !== 0) {
      return;
    }
    sub = new Subreddit({
      category: "custom",
      name: val,
      text: val
    });
    RMP.subredditplaylist.add(sub);
    sub.save();
    return this.render();
  },
  render: function() {
    return this.$("input").val("");
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      console.log("Custom Subreddit :: Ready");
    }
    this.listenTo(RMP.subredditplaylist, "add", this.render);
    return this.listenTo(RMP.subredditplaylist, "remove", this.render);
  }
});

RMP.subredditsSelection = [];

RMP.subredditplaylist = new SubredditPlaylist;

RMP.subredditplaylistview = new SubredditPlayListView({
  el: $(".content.browse .my.reddit.menu")
});

RMP.customsubreddit = new CustomSubreddit({
  el: $(".content.browse .custom-subreddit")
});

RMP.dispatcher.on("loaded:browse", function(page) {
  RMP.subredditsSelection = [];
  if (FLAG_DEBUG) {
    console.time("Making Views");
  }
  $(".content.browse .reddit.subreddits.menu").each(function(index, element) {
    return RMP.subredditsSelection.push(new SubredditSelectionView({
      el: element
    }));
  });
  if (FLAG_DEBUG) {
    console.timeEnd("Making Views");
  }
  RMP.subredditplaylistview.setElement($(".content.browse .my.reddit.menu"));
  if (RMP.subredditplaylist.length > 0) {
    RMP.subredditplaylistview.render();
  }
  return RMP.customsubreddit.setElement($(".content.browse .custom-subreddit"));
});

RMP.dispatcher.on("app:main", function() {
  var newList;
  if (RMP.URLsubreddits != null) {
    if (FLAG_DEBUG) {
      console.log("URL :: ", RMP.URLsubreddits);
    }
    newList = _.map(RMP.URLsubreddits, function(sub) {
      return new Subreddit({
        category: "url",
        name: sub,
        text: sub
      });
    });
    return RMP.subredditplaylist.add(newList);
  } else {
    RMP.subredditplaylist.fetch({
      reset: true
    });
    if (RMP.subredditplaylist.length === 0) {
      return RMP.subredditplaylist.add(new Subreddit({
        category: "Other",
        name: "listentothis",
        text: "Listen To This"
      }));
    }
  }
});

timeSince = function(time) {
  var interval, seconds;
  seconds = Math.floor((new Date() - time) / 1000);
  interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return (Math.floor(seconds)) + " seconds";
};

Song = Backbone.Model.extend({
  type: "none",
  playable: false,
  initialize: function() {
    var time;
    time = new Date();
    time.setTime(parseInt(this.get("created_utc")) * 1000);
    this.set("created_ago", timeSince(time));
    this.set("type", this.type);
    return this.set("playable", this.playable);
  }
});

SongYoutube = Song.extend({
  type: "youtube",
  playable: true
});

SongSoundcloud = Song.extend({
  type: "soundcloud",
  playable: true
});

SongBandcamp = Song.extend({
  type: "bandcamp",
  playable: true
});

SongMP3 = Song.extend({
  type: "mp3",
  playable: true
});

SongVimeo = Song.extend({
  type: "vimeo",
  playable: true
});

NotASong = Backbone.Model.extend({
  type: "link",
  playable: false,
  initialize: function() {
    var time;
    time = new Date();
    time.setTime(parseInt(this.get("created_utc")) * 1000);
    this.set("created_ago", timeSince(time));
    this.set("type", this.type);
    return this.set("playable", this.playable);
  }
});

NotALink = NotASong.extend({
  type: "self"
});

Playlist = Backbone.Collection.extend({
  current: {
    song: null,
    index: -1
  },
  parseSong: function(item) {
    var song;
    return song = (function() {
      switch (false) {
        case !(item.domain === "youtube.com" || item.domain === "youtu.be" || item.domain === "m.youtube.com"):
          return new SongYoutube(item);
        case item.domain !== "soundcloud.com":
          return new SongSoundcloud(item);
        case item.domain.substr(-12) !== "bandcamp.com":
          return new SongBandcamp(item);
        case item.url.substr(-4) !== ".mp3":
          return new SongMP3(item);
        case item.domain !== "vimeo.com":
          return new SongVimeo(item);
        case !item.is_self:
          return new NotALink(item);
        default:
          return new NotASong(item);
      }
    })();
  },
  activate: function(song) {
    var index;
    index = _.indexOf(this.models, song);
    this.current.song = song;
    this.current.index = index;
    RMP.dispatcher.trigger("song:change", index, song);
    if (this.current.index >= this.length - 1) {
      return this.more();
    }
  },
  refresh: function() {
    return RMP.reddit.getMusic((function(_this) {
      return function(items) {
        var list;
        list = [];
        _.each(items, function(item) {
          var existingSong;
          existingSong = _this.find(function(existingItem) {
            return item.data.id === existingItem.get("id");
          });
          if (existingSong != null) {
            return list.push(existingSong);
          } else {
            return list.push(_this.parseSong(item.data));
          }
        });
        _this.reset(list);
        _this.current.index = _this.indexOf(_this.current.song);
        return RMP.dispatcher.trigger("app:loadedMusic");
      };
    })(this));
  },
  more: function(callback) {
    return RMP.reddit.getMore(this.last().get("name"), (function(_this) {
      return function(items) {
        if (FLAG_DEBUG) {
          console.log(items);
        }
        _.each(items, function(item) {
          return _this.add(_this.parseSong(item.data));
        });
        if (callback != null) {
          return callback();
        }
      };
    })(this));
  },
  forward: function() {
    if (RMP.remote.get("receiver") === false) {
      return;
    }
    if (this.current.index >= this.length - 1) {
      return this.more((function(_this) {
        return function() {
          return _this.forward();
        };
      })(this));
    } else {
      this.current.index++;
      this.current.song = this.at(this.current.index);
      if (this.current.song.get("playable") === false) {
        return this.forward();
      } else {
        return this.activate(this.current.song);
      }
    }
  },
  backward: function() {
    if (RMP.remote.get("receiver") === false) {
      return;
    }
    if (this.current.index - 1 <= 0) {
      this.current.song = this.at(this.current.index - 1);
      if (this.current.song.get("playable") === true) {
        this.current.index = 0;
        return this.activate(this.current.song);
      }
    } else {
      this.current.index--;
      this.current.song = this.at(this.current.index);
      if (this.current.song.get("playable") === false) {
        return this.backward();
      } else {
        return this.activate(this.current.song);
      }
    }
  },
  playFirstSongIfEmpty: function() {
    if (this.current.index === -1) {
      return this.forward();
    }
  },
  initialize: function() {
    this.listenTo(RMP.subredditplaylist, "add", this.refresh);
    this.listenTo(RMP.subredditplaylist, "remove", this.refresh);
    this.listenTo(RMP.subredditplaylist, "reset", this.refresh);
    this.listenTo(RMP.dispatcher, "controls:forward", this.forward);
    this.listenTo(RMP.dispatcher, "controls:backward", this.backward);
    this.listenTo(RMP.dispatcher, "controls:play", this.playFirstSongIfEmpty);
    this.listenTo(RMP.dispatcher, "controls:sortMethod", this.refresh);
    this.listenTo(RMP.dispatcher, "player:ended", this.forward);
    if (FLAG_DEBUG) {
      return console.log("Playlist :: Ready");
    }
  }
});

PlaylistView = Backbone.View.extend({
  tagName: "div",
  className: "playlist",
  events: {
    "click .ui.item": "activate",
    "click .item.more": "more"
  },
  more: function(e) {
    this.$(".more").html("<i class='icon notched circle loading'></i>");
    return RMP.playlist.more();
  },
  activate: function(e) {
    var id, song, target;
    target = $(e.currentTarget);
    id = target.data("id");
    song = RMP.playlist.get(id);
    return RMP.playlist.activate(song);
  },
  template: Templates.PlayListView,
  render: function() {
    this.$el.html("");
    RMP.playlist.each((function(_this) {
      return function(model) {
        return _this.$el.append(_this.template(model.toJSON()));
      };
    })(this));
    this.$el.append($("<div class='item more'>Load More</div>"));
    return this.setCurrent(RMP.playlist.current.index, RMP.playlist.current.song);
  },
  setCurrent: function(index, song) {
    this.$(".item").removeClass("active");
    return $(this.$(".item")[index]).addClass("active");
  },
  initialize: function() {
    this.listenTo(RMP.playlist, "add", this.render);
    this.listenTo(RMP.playlist, "remove", this.render);
    this.listenTo(RMP.playlist, "reset", this.render);
    this.listenTo(RMP.dispatcher, "song:change", this.setCurrent);
    if (FLAG_DEBUG) {
      return console.log("PlayListView :: Ready");
    }
  }
});

SortMethodView = Backbone.View.extend({
  events: {
    "click .sort.item": "select"
  },
  getCurrent: function() {
    return this.$("[data-value='" + (RMP.reddit.get('sortMethod')) + "']");
  },
  render: function() {
    this.$(".item").removeClass("active");
    this.getCurrent().addClass("active");
    return this.$(".ui.dropdown").dropdown("set selected", "top:" + (RMP.reddit.get('topMethod')));
  },
  select: function(e) {
    var method, sortMethod, target, topMethod;
    target = $(e.currentTarget);
    method = target.data("value");
    if (method == null) {
      return;
    }
    sortMethod = method;
    topMethod = RMP.reddit.get("topMethod");
    if (method.substr(0, 3) === "top") {
      sortMethod = "top";
      topMethod = method.substr(4);
    }
    RMP.reddit.changeSortMethod(sortMethod, topMethod);
    RMP.dispatcher.trigger("controls:sortMethod", sortMethod, topMethod);
    return this.render();
  },
  initialize: function() {
    return this.render();
  }
});

RMP.playlist = new Playlist;

RMP.playlistview = new PlaylistView({
  el: $(".content.playlist .music.playlist")
});

RMP.sortmethodview = new SortMethodView({
  el: $(".content.playlist .sortMethod")
});

RMP.dispatcher.on("loaded:playlist", function(page) {
  RMP.playlistview.setElement($(".content.playlist .music.playlist"));
  if (RMP.playlist.length > 0) {
    RMP.playlistview.render();
  }
  RMP.sortmethodview.setElement($(".content.playlist .sortMethod"));
  return RMP.sortmethodview.render();
});

CurrentSongView = Backbone.View.extend({
  template: Templates.CurrentSongView,
  events: {
    "click .upvote": "vote",
    "click .downvote": "vote"
  },
  vote: function(e) {
    var dir, id, parent, target;
    if (RMP.authentication == null) {
      return;
    }
    target = $(e.currentTarget);
    parent = target.parents(".vote");
    id = parent.attr('id');
    dir = (function() {
      switch (false) {
        case !target.hasClass("active"):
          return 0;
        case !target.hasClass("upvote"):
          return 1;
        case !target.hasClass("downvote"):
          return -1;
      }
    })();
    RMP.reddit.vote(id, dir);
    $(parent.find(".upvote, .downvote")).removeClass("active");
    if (dir === 1 || dir === -1) {
      return target.addClass("active");
    }
  },
  render: function(index, song) {
    var songJSON;
    if (song == null) {
      song = RMP.playlist.current.song;
    }
    if (song == null) {
      return;
    }
    songJSON = song.toJSON();
    this.$el.html(this.template(songJSON));
    $('.self.text').html($($('.self.text').text()));
    if (song.playable === true) {
      $(".current-song-sidebar .title").text(songJSON.title);
      document.title = songJSON.title + " | Reddit Music Player";
      if (song.get("type") === "bandcamp" && song.get("media")) {
        console.log(song.get("media"));
        return $(".current-song-sidebar .image").attr("src", song.get("media").oembed.thumbnail_url);
      } else {
        return $(".current-song-sidebar .image").attr("src", "");
      }
    }
  },
  initialize: function() {
    this.listenTo(RMP.dispatcher, "song:change", this.render);
    if (FLAG_DEBUG) {
      return console.log("CurrentSongView :: Ready");
    }
  }
});

CommentsView = Backbone.View.extend({
  template: Templates.CommentsView,
  events: {
    "click .upvote": "vote",
    "click .downvote": "vote",
    "click .actions .reply": "reply",
    "click .form .add_comment": "add_comment",
    "click .reply_to .close": "reply_close"
  },
  reply: function(e) {
    var id, parent, target, temp;
    if (RMP.authentication == null) {
      return;
    }
    target = $(e.currentTarget);
    parent = target.parents(".comment");
    id = parent.attr('id');
    this.reply_id = id;
    this.reply_author = $(parent.find(".author")).text();
    this.$(".reply_to").remove();
    temp = Templates.ReplyTo({
      author: this.reply_author,
      id: this.reply_id
    });
    return this.$el.append(temp);
  },
  reply_close: function(e) {
    var target;
    target = $(e.currentTarget.parentElement);
    this.reply_id = this.reply_author = null;
    return target.remove();
  },
  add_comment: function(e) {
    var id, parent, target, text;
    if (RMP.authentication == null) {
      return;
    }
    target = $(e.currentTarget);
    parent = target.parents(".comment");
    id = parent.attr('id');
    if (this.reply_id == null) {
      this.reply_id = RMP.playlist.current.song.get("name");
    }
    text = this.$(".comment_text").val();
    this.$(".comment_text").val("");
    return RMP.reddit.addComment({
      text: text,
      thing_id: this.reply_id,
      callback: (function(_this) {
        return function(reply) {
          RMP.playlist.current.song.set("num_comments", RMP.playlist.current.song.get("num_comments") + 1);
          if (FLAG_DEBUG) {
            console.log(reply);
          }
          return _this.render();
        };
      })(this)
    });
  },
  vote: function(e) {
    var dir, dirClass, dirEl, id, initial, parent, target;
    if (RMP.authentication == null) {
      return;
    }
    target = $(e.currentTarget);
    parent = target.parents(".comment");
    id = parent.attr('id');
    dir = (function() {
      switch (false) {
        case !target.hasClass("active"):
          return 0;
        case !target.hasClass("upvote"):
          return 1;
        case !target.hasClass("downvote"):
          return -1;
      }
    })();
    RMP.reddit.vote(id, dir);
    $(parent.find(".upvote, .downvote")).removeClass("active");
    $(parent.find(".ups")).text(parent.data("ups"));
    $(parent.find(".downs")).text(parent.data("downs"));
    if (dir === 1 || dir === -1) {
      dirClass = dir === 1 ? "ups" : "downs";
      dirEl = $(parent.find("." + dirClass));
      initial = parent.data(dirClass);
      dirEl.text(parseInt(initial) + 1);
      return target.addClass("active");
    }
  },
  renderComment: function(comment) {
    var html, time;
    time = new Date();
    time.setTime(parseInt(comment.created_utc) * 1000);
    comment.created_ago = timeSince(time);
    html = $(this.template(comment));
    if (FLAG_DEBUG) {
      console.log(comment);
    }
    if (typeof comment.replies === 'object') {
      html.append(this.parse(comment.replies.data.children));
    }
    return html;
  },
  parse: function(comments) {
    var root;
    root = $("<div class='comments'></div>");
    _.each(comments, (function(_this) {
      return function(comment) {
        return root.append(_this.renderComment(comment.data));
      };
    })(this));
    return root;
  },
  render: function(index, song) {
    var permalink, songJSON;
    if (song == null) {
      song = RMP.playlist.current.song;
    }
    if (song == null) {
      return;
    }
    songJSON = song.toJSON();
    this.$(".num_comments").text(songJSON.num_comments);
    this.$(".comments.overview").html("");
    permalink = songJSON.permalink;
    if (songJSON.num_comments > 0) {
      return RMP.reddit.getComments(permalink, (function(_this) {
        return function(comments_tree) {
          return _.each(comments_tree, function(comment) {
            return _this.$(".comments.overview").append(_this.renderComment(comment.data));
          });
        };
      })(this));
    }
  },
  initialize: function() {
    this.listenTo(RMP.dispatcher, "song:change", this.render);
    if (FLAG_DEBUG) {
      return console.log("CommentsView :: Ready");
    }
  }
});

RMP.currentsongview = new CurrentSongView({
  el: $(".content.playlist .current.song")
});

RMP.commentsview = new CommentsView({
  el: $(".content.playlist .comments.root")
});

RMP.dispatcher.on("loaded:playlist", function(page) {
  RMP.currentsongview.setElement($(".content.song .current.song"));
  RMP.currentsongview.render();
  RMP.commentsview.setElement($(".content.song .comments.root"));
  return RMP.commentsview.render();
});

MusicPlayer = Backbone.Model.extend({
  type: "none"
});

YoutubePlayer = MusicPlayer.extend({
  type: "youtube",
  onPlayerReady: function(e) {
    return e.target.playVideo();
  },
  onPlayerStateChange: function(e) {
    if (FLAG_DEBUG) {
      console.log("YoutubePlayer :: StateChange", e);
    }
    switch (e.data) {
      case YT.PlayerState.UNSTARTED:
        return RMP.dispatcher.trigger("player:unstarted", this);
      case YT.PlayerState.PLAYING:
        return RMP.dispatcher.trigger("player:playing", this);
      case YT.PlayerState.PAUSED:
        return RMP.dispatcher.trigger("player:paused", this);
      case YT.PlayerState.ENDED:
        return RMP.dispatcher.trigger("player:ended", this);
      case YT.PlayerState.CUED:
        return RMP.dispatcher.trigger("player:cued", this);
      case YT.PlayerState.BUFFERING:
        return RMP.dispatcher.trigger("player:buffering", this);
    }
  },
  onError: function(e) {
    if (FLAG_DEBUG) {
      console.error("YoutubePlayer :: Error", e);
    }
    return RMP.dispatcher.trigger("controls:forward");
  },
  events: function() {
    return {
      "onReady": this.onPlayerReady,
      "onStateChange": this.onPlayerStateChange,
      "onError": this.onError
    };
  },
  init: function() {
    var isReady;
    isReady = typeof YT !== "undefined" && YT !== null;
    if (!isReady) {
      throw "Youtube not Ready!";
    }
    return this.player = new YT.Player("player", {
      videoId: this.track.id,
      events: this.events()
    });
  },
  initProgress: function() {
    var getData;
    this.player.setVolume(RMP.volumecontrol.model.get("volume") * 100);
    RMP.dispatcher.trigger("progress:duration", this.player.getDuration());
    getData = (function(_this) {
      return function() {
        RMP.dispatcher.trigger("progress:current", _this.player.getCurrentTime());
        return RMP.dispatcher.trigger("progress:loaded", _this.player.getVideoLoadedFraction());
      };
    })(this);
    if (this.interval == null) {
      this.interval = setInterval(getData, 200);
    }
    if (FLAG_DEBUG) {
      return console.log("YoutubePlayer :: Interval Set :: " + this.interval);
    }
  },
  clean: function() {
    this.player.destroy();
    clearInterval(this.interval);
    this.interval = null;
    this.stopListening();
    this.off();
    return this.trigger("destroy");
  },
  "switch": function(song) {
    this.set(song.attributes);
    this.getTrack();
    return this.player.loadVideoById(this.track.id);
  },
  playPause: function() {
    if (this.player && (this.player.getPlayerState != null) && (this.player.pauseVideo != null) && (this.player.playVideo != null)) {
      if (this.player.getPlayerState() === 1) {
        return this.player.pauseVideo();
      } else {
        return this.player.playVideo();
      }
    }
  },
  volume: function(value) {
    return this.player.setVolume(value * 100);
  },
  seekTo: function(percentage, seekAhead) {
    return this.player.seekTo(percentage * this.player.getDuration(), seekAhead);
  },
  findYoutubeId: function(url) {
    var domain, regex;
    console.log(this.attributes);
    domain = this.get("domain");
    if (this.get("domain") === "youtu.be") {
      regex = this.track.url.match(/\/\/youtu.be\/(.*)$/);
      if (regex && regex[1]) {
        return regex[1];
      } else {
        return null;
      }
    } else {
      regex = this.track.url.match(/\/\/.*=([\w+]+)$/);
      if (regex && regex[1]) {
        return regex[1];
      } else {
        return null;
      }
    }
  },
  getTrack: function() {
    var id;
    if (this.attributes.media === null) {
      if (FLAG_DEBUG) {
        console.error("YoutubePlayer :: No Media Data");
      }
      this.track = {
        url: this.attributes.url
      };
      id = this.findYoutubeId(this.track.url);
      if (id) {
        return this.track.id = id;
      } else {
        return RMP.dispatcher.trigger("controls:forward");
      }
    } else {
      this.track = this.attributes.media.oembed;
      return this.track.id = this.track.url.substr(31);
    }
  },
  initialize: function() {
    if (this.$el == null) {
      this.$el = $("#player");
    }
    this.getTrack();
    this.init();
    this.listenTo(RMP.dispatcher, "player:playing", this.initProgress);
    if (FLAG_DEBUG) {
      console.log("YoutubePlayer :: ", this.track);
    }
    if (FLAG_DEBUG) {
      return console.log("Player :: Youtube");
    }
  }
});

SoundcloudPlayer = MusicPlayer.extend({
  type: "soundcloud",
  events: function() {
    return {
      "playProgress": this.progress_play,
      "play": this.event_trigger("playing"),
      "pause": this.event_trigger("paused"),
      "finish": this.event_trigger("ended")
    };
  },
  progress_play: function(data) {
    RMP.dispatcher.trigger("progress:current", data.currentPosition / 1000);
    return RMP.dispatcher.trigger("progress:loaded", data.loadedProgress);
  },
  playerState: "ended",
  event_trigger: function(ev) {
    return (function(_this) {
      return function(data) {
        _this.player.setVolume(RMP.volumecontrol.model.get("volume") * 100);
        _this.player.getDuration(function(duration) {
          return RMP.dispatcher.trigger("progress:duration", duration / 1000);
        });
        _this.playerState = ev;
        return RMP.dispatcher.trigger("player:" + ev, _this);
      };
    })(this);
  },
  playPause: function() {
    return this.player.toggle();
  },
  volume: function(value) {
    return this.player.setVolume(value * 100);
  },
  seekTo: function(percentage, seekAhead) {
    return this.player.getDuration((function(_this) {
      return function(duration) {
        return _this.player.seekTo(percentage * duration);
      };
    })(this));
  },
  "switch": function(song) {
    this.set(song.attributes);
    return this.init((function(_this) {
      return function() {
        return _this.player.load(_this.track.sc.uri, {
          auto_play: true
        });
      };
    })(this));
  },
  setUp: function(callback) {
    var iframe;
    if (this.player == null) {
      if (FLAG_DEBUG) {
        console.log("setting up iframe");
      }
      if ($("#soundcloud").length === 0) {
        iframe = $("<iframe id='soundcloud' src='//w.soundcloud.com/player/?visual=true&url=" + this.track.sc.uri + "'>").appendTo($("#player"));
      }
      this.player = SC.Widget("soundcloud");
      _.each(this.events(), (function(_this) {
        return function(listener, ev) {
          return _this.player.bind(ev, listener);
        };
      })(this));
    }
    if (callback != null) {
      return callback();
    }
  },
  clean: function() {
    this.$el.html("");
    this.stopListening();
    this.off();
    return this.trigger("destroy");
  },
  init: function(callback) {
    var track_id, url, user_id;
    this.track = this.attributes.media.oembed;
    url = decodeURIComponent(decodeURIComponent(this.track.html));
    user_id = url.match(/\/users\/(\d+)/);
    if (user_id != null) {
      this.track.type = "users";
    }
    if (user_id != null) {
      this.track.id = user_id[1];
    }
    track_id = url.match(/\/tracks\/(\d+)/);
    if (track_id != null) {
      this.track.type = "tracks";
    }
    if (track_id != null) {
      this.track.id = track_id[1];
    }
    track_id = url.match(/\/playlists\/(\d+)/);
    if (track_id != null) {
      this.track.type = "playlists";
    }
    if (track_id != null) {
      this.track.id = track_id[1];
    }
    console.log(this.track);
    return $.ajax({
      url: API.Soundcloud.base + "/" + this.track.type + "/" + this.track.id + ".json?callback=?",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        client_id: API.Soundcloud.key
      },
      success: (function(_this) {
        return function(sctrack) {
          if (FLAG_DEBUG) {
            console.log(sctrack);
          }
          if (!sctrack.streamable) {
            throw "not streamable";
          }
          _this.track.sc = sctrack;
          RMP.progressbar.enableSoundcloud(_this.track.sc.waveform_url);
          return _this.setUp(callback);
        };
      })(this)
    });
  },
  initialize: function() {
    if (this.$el == null) {
      this.$el = $("#player");
    }
    return this.init((function(_this) {
      return function() {
        return _this.player.load(_this.track.sc.uri, {
          auto_play: true
        });
      };
    })(this));
  }
});

MP3Player = MusicPlayer.extend({
  type: "mp3",
  events: function() {
    return {
      "progress": this.progress_play(),
      "play": this.event_trigger("playing"),
      "playing": this.event_trigger("playing"),
      "pause": this.event_trigger("paused"),
      "ended": this.event_trigger("ended"),
      "durationchange": this.setDuration()
    };
  },
  setDuration: function() {
    return (function(_this) {
      return function() {
        return RMP.dispatcher.trigger("progress:duration", _this.player.duration);
      };
    })(this);
  },
  progress_play: function(data) {
    return (function(_this) {
      return function() {
        RMP.dispatcher.trigger("progress:loaded", _this.player.buffered.end(0) / _this.player.duration);
        return RMP.dispatcher.trigger("progress:current", _this.player.currentTime);
      };
    })(this);
  },
  playerState: "ended",
  event_trigger: function(ev) {
    return (function(_this) {
      return function(data) {
        _this.playerState = ev;
        return RMP.dispatcher.trigger("player:" + ev, _this);
      };
    })(this);
  },
  init: function() {
    if (FLAG_DEBUG) {
      console.log("MP3Player :: Making Player");
    }
    this.player = $("<audio controls autoplay='true' src='" + this.attributes.streaming_url + "'/>").appendTo(this.$el)[0];
    if (FLAG_DEBUG) {
      console.log(this.$el);
    }
    this.player.play();
    this.player.volume = RMP.volumecontrol.model.get("volume");
    return _.each(this.events(), (function(_this) {
      return function(listener, ev) {
        return $(_this.player).bind(ev, listener);
      };
    })(this));
  },
  clean: function(justTheElement) {
    $(this.player).remove();
    this.$el.html("");
    if (justTheElement == null) {
      this.stopListening();
    }
    if (justTheElement == null) {
      this.trigger("destroy");
    }
    if (!justTheElement) {
      return this.off;
    }
  },
  "switch": function(song) {
    this.set(song.attributes);
    this.set("streaming_url", this.get("url"));
    this.clean(true);
    return this.init();
  },
  playPause: function() {
    if (this.playerState === "playing") {
      return this.player.pause();
    } else {
      return this.player.play();
    }
  },
  volume: function(value) {
    return this.player.volume = value;
  },
  seekTo: function(percentage, seekAhead) {
    return this.player.currentTime = percentage * this.player.duration;
  },
  initialize: function() {
    if (this.$el == null) {
      this.$el = $("#player");
    }
    this.$el.html("");
    this.set("streaming_url", this.get("url"));
    return this.init();
  }
});

BandcampPlayer = MP3Player.extend({
  type: "bandcamp",
  getID: function(callback) {
    return $.ajax({
      url: API.Bandcamp.base + "/url/1/info",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        key: API.Bandcamp.key,
        url: this.get("url")
      },
      success: (function(_this) {
        return function(data) {
          _this.set(data);
          return callback(data);
        };
      })(this)
    });
  },
  getAlbumInfo: function(callback) {
    return $.ajax({
      url: API.Bandcamp.base + "/album/2/info",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        key: API.Bandcamp.key,
        album_id: this.get("album_id")
      },
      success: (function(_this) {
        return function(data) {
          _this.set(data);
          _this.set(data.tracks[0]);
          return callback(data);
        };
      })(this)
    });
  },
  getTrackInfo: function(callback) {
    return $.ajax({
      url: API.Bandcamp.base + "/track/3/info",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        key: API.Bandcamp.key,
        track_id: this.get("track_id")
      },
      success: (function(_this) {
        return function(data) {
          _this.set(data);
          return callback(data);
        };
      })(this)
    });
  },
  errorAvoidBandCamp: function(ids) {
    console.error("BandCampPlayer :: Error", ids.error_message);
    SongBandcamp.prototype.playable = false;
    _.each(RMP.playlist.where({
      type: "bandcamp"
    }), function(item) {
      return item.set("playable", false);
    });
    return RMP.dispatcher.trigger("controls:forward");
  },
  getInfo: function(callback) {
    return this.getID((function(_this) {
      return function(ids) {
        if (ids.error != null) {
          return _this.errorAvoidBandCamp(ids);
        }
        if (FLAG_DEBUG) {
          console.log("BandCampPlayer :: IDs Get");
        }
        if (ids.track_id == null) {
          if (FLAG_DEBUG) {
            console.log("BandCampPlayer :: No Track ID", ids);
          }
          if (ids.album_id != null) {
            if (FLAG_DEBUG) {
              console.log("BandCampPlayer :: Get Album Info");
            }
            return _this.getAlbumInfo(callback);
          }
        } else {
          if (FLAG_DEBUG) {
            console.log("BandCampPlayer :: Get Track Info");
          }
          return _this.getTrackInfo(callback);
        }
      };
    })(this));
  },
  "switch": function(song) {
    this.set(song.attributes);
    this.clean(true);
    return this.getInfo((function(_this) {
      return function() {
        RMP.dispatcher.trigger("progress:duration", _this.get("duration"));
        return _this.init();
      };
    })(this));
  },
  initialize: function() {
    if (this.$el == null) {
      this.$el = $("#player");
    }
    this.$el.html("");
    return this.getInfo((function(_this) {
      return function() {
        RMP.dispatcher.trigger("progress:duration", _this.get("duration"));
        return _this.init();
      };
    })(this));
  }
});

VimeoPlayer = MusicPlayer.extend({
  type: "vimeo",
  events: function() {},
  setDuration: function() {},
  progress_play: function(data) {},
  playerState: "ended",
  event_trigger: function(ev) {},
  init: function() {
    var player;
    if (FLAG_DEBUG) {
      console.log("VimeoPlayer :: Making Player");
    }
    player = $("<iframe src='http://player.vimeo.com/video/" + this.track.id + "?api=1&autoplay=1' webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder='0'>");
    this.$el.append(player);
    this.player = player[0].contentWindow;
    return this.player.postMessage({
      "method": "play"
    }, "*");
  },
  clean: function(justTheElement) {
    $("#player iframe").remove();
    this.$el.html("");
    if (justTheElement == null) {
      this.stopListening();
    }
    if (justTheElement == null) {
      this.trigger("destroy");
    }
    if (!justTheElement) {
      return this.off;
    }
  },
  "switch": function(song) {
    var url, video_id;
    this.set(song.attributes);
    this.track = this.attributes.media.oembed;
    url = decodeURIComponent(decodeURIComponent(this.track.html));
    video_id = url.match(/\/video\/(\d+)/);
    if (video_id != null) {
      this.track.id = video_id[1];
    }
    this.clean(true);
    return this.init();
  },
  playPause: function() {
    if (this.playerState === "playing") {
      return this.player.postMessage({
        method: "pause"
      }, "*");
    } else {
      return this.player.postMessage({
        method: "play"
      }, "*");
    }
  },
  seekTo: function(percentage, seekAhead) {},
  initialize: function() {
    var url, video_id;
    if (this.$el == null) {
      this.$el = $("#player");
    }
    this.$el.html("");
    this.track = this.attributes.media.oembed;
    url = decodeURIComponent(decodeURIComponent(this.track.html));
    video_id = url.match(/\/video\/(\d+)/);
    if (video_id != null) {
      this.track.id = video_id[1];
    }
    return this.init();
  }
});

PlayerController = Backbone.Model.extend({
  change: function(index, song) {
    if (this.controller == null) {
      return this.controller = (function() {
        switch (false) {
          case song.type !== "youtube":
            return new YoutubePlayer(song.attributes);
          case song.type !== "soundcloud":
            return new SoundcloudPlayer(song.attributes);
          case song.type !== "bandcamp":
            return new BandcampPlayer(song.attributes);
          case song.type !== "vimeo":
            return new VimeoPlayer(song.attributes);
          case song.type !== "mp3":
            return new MP3Player(song.attributes);
          default:
            throw "Not A Song Sent to Player Controller";
        }
      })();
    } else {
      if (song.playable === true) {
        if (this.controller.type === song.type) {
          if (this.controller.get("id") !== song.get("id")) {
            return this.controller["switch"](song);
          }
        } else {
          this.controller.clean();
          this.controller = null;
          return this.change(index, song);
        }
      }
    }
  },
  playPause: function(e) {
    if (RMP.remote.get("receiver") === false) {
      return;
    }
    if (this.controller == null) {
      return;
    }
    if (FLAG_DEBUG) {
      console.log("PlayerController : PlayPause");
    }
    return this.controller.playPause();
  },
  volume: function(value) {
    if (this.controller == null) {
      return;
    }
    if (FLAG_DEBUG) {
      console.log("PlayerController :: Volume");
    }
    return this.controller.volume(value);
  },
  seekTo: function(percentage, seekAhead) {
    if (this.controller == null) {
      return;
    }
    return this.controller.seekTo(percentage, seekAhead);
  },
  initialize: function() {
    this.listenTo(RMP.dispatcher, "song:change", this.change);
    this.listenTo(RMP.dispatcher, "controls:play", this.playPause);
    this.listenTo(RMP.dispatcher, "controls:volume", this.volume);
    return this.listenTo(RMP.dispatcher, "progress:set", this.seekTo);
  }
});

RMP.player = new PlayerController;

RMP.dispatcher.once("app:main", function() {
  $("<script src='https://www.youtube.com/iframe_api' />").appendTo($(".scripts"));
  return $("<script src='https://w.soundcloud.com/player/api.js' />").appendTo($(".scripts"));
});

onYouTubeIframeAPIReady = function() {
  if (FLAG_DEBUG) {
    console.log("Youtube :: iFramed");
  }
  return RMP.dispatcher.trigger("youtube:iframe");
};

Search = Backbone.Model.extend({
  defaults: {
    sites: "site:youtube.com OR site:soundcloud.com OR site:bandcamp.com OR site:vimeo.com OR site:youtu.be OR site:m.youtube.com"
  },
  toString: function() {
    return this.get("text") + " " + this.get("sites");
  },
  initialize: function(text1) {
    this.text = text1;
  }
});

SearchView = Backbone.View.extend({
  events: {
    "keyup input": "enter",
    "click .button": "submit"
  },
  enter: function(e) {
    if (e.keyCode !== 13) {
      return;
    }
    return this.submit();
  },
  submit: function() {
    var val;
    val = this.$("input").val();
    if (val == null) {
      return;
    }
    if (val.trim().length < 3) {
      return;
    }
    RMP.search = new Search({
      text: val
    });
    RMP.playlist.refresh();
    return RMP.subredditplaylistview.render();
  },
  initialize: function() {
    if (FLAG_DEBUG) {
      return console.log("Search View :: Ready");
    }
  }
});

RMP.searchview = new SearchView({
  model: RMP.remote,
  el: $(".content.browse .search-reddit")
});

RMP.dispatcher.on("loaded:browse", function(page) {
  return RMP.searchview.setElement($(".content.browse .search-reddit"));
});

Remote = Backbone.Model.extend({
  defaults: {
    receiver: true
  },
  triggerOnEmit: function(type) {
    return this.socket.on(type, (function(_this) {
      return function(data) {
        if (_this.get("receiver") === false) {
          return;
        }
        if (FLAG_DEBUG) {
          console.log("Socket :: Receive :: " + type, data);
        }
        return RMP.dispatcher.trigger(type, data);
      };
    })(this));
  },
  send: function(type, data) {
    if (FLAG_DEBUG) {
      console.log("Socket :: Send :: " + type, data);
    }
    return this.socket.emit(type, data);
  },
  setReceiver: function(bool) {
    return this.set("receiver", bool);
  },
  forward: function() {
    if (this.get("receiver") === true) {
      return;
    }
    return this.send("controls:forward");
  },
  backward: function() {
    if (this.get("receiver") === true) {
      return;
    }
    return this.send("controls:backward");
  },
  playPause: function() {
    if (this.get("receiver") === true) {
      return;
    }
    return this.send("controls:play");
  },
  requestHash: function(cb) {
    if (this.get("receiver") === false) {
      return;
    }
    return $.get("/remote/generate", function(hash) {
      return cb(hash);
    });
  },
  setHash: function(hash) {
    this.set("hash", hash);
    if (this.has("name") === false) {
      this.socket = io();
      this.socket.emit("join:hash", hash);
      this.listenTo(RMP.dispatcher, "controls:forward", this.forward);
      this.listenTo(RMP.dispatcher, "controls:backward", this.backward);
      return this.listenTo(RMP.dispatcher, "controls:play", this.playPause);
    }
  },
  initialize: function() {
    return RMP.dispatcher.once("authenticated", (function(_this) {
      return function(authentication) {
        var ev, j, len, simpleEvents;
        _this.set("name", authentication.get("name"));
        _this.socket = io();
        simpleEvents = ["controls:forward", "controls:backward", "controls:play", "remote:subreddits"];
        for (j = 0, len = simpleEvents.length; j < len; j++) {
          ev = simpleEvents[j];
          _this.triggerOnEmit(ev);
        }
        _this.listenTo(RMP.dispatcher, "controls:forward", _this.forward);
        _this.listenTo(RMP.dispatcher, "controls:backward", _this.backward);
        return _this.listenTo(RMP.dispatcher, "controls:play", _this.playPause);
      };
    })(this));
  }
});

RemoteView = Backbone.View.extend({
  events: {
    "click .remote-controls .remote-btn": "button",
    "click .subreddits-copy": "copySubreddits",
    "click .generate-link": "generateLink"
  },
  generateLink: function() {
    return this.model.requestHash((function(_this) {
      return function(hash) {
        var url;
        _this.model.socket.emit("join:hash", hash);
        url = API.MusicPlayer.base + "/remote/" + hash;
        _this.$(".hashlink").attr("href", url);
        _this.$(".hashlink .text").text(hash);
        _this.$(".qrcode").html("");
        return _this.$(".qrcode").qrcode({
          text: url
        });
      };
    })(this));
  },
  copySubreddits: function() {
    return this.model.send("remote:subreddits", RMP.subredditplaylist.toString());
  },
  button: function(e) {
    var item, type;
    item = $(e.currentTarget);
    if (item.hasClass("disabled")) {
      return;
    }
    type = item.data("type");
    return this.model.send(type);
  },
  render: function() {
    if (this.model.has("hash") === true) {
      this.$(".dimmer").removeClass("active");
    }
    if (this.model.get("receiver") === true) {
      this.$(".checkbox.receiver input").prop("checked", true);
      this.$(".remote-controls").hide();
      return this.$(".remote-receiver").show();
    } else {
      this.$(".checkbox.commander input").prop("checked", true);
      this.$(".remote-controls").show();
      return this.$(".remote-receiver").hide();
    }
  },
  setReceiver: function() {
    return RMP.remoteview.model.set("receiver", true);
  },
  setCommander: function() {
    return RMP.remoteview.model.set("receiver", false);
  },
  changeElement: function() {
    this.$(".checkbox.radio").checkbox({
      onChange: (function(_this) {
        return function(value) {
          if (_this.$(".checkbox.receiver input").is(":checked")) {
            return _this.setReceiver();
          } else {
            return _this.setCommander();
          }
        };
      })(this)
    });
    this.render();
    if (this.model.has("name")) {
      return this.$(".dimmer").removeClass("active");
    }
  },
  initialize: function() {
    this.render();
    this.listenTo(this.model, "change", this.render);
    return RMP.dispatcher.once("authenticated", (function(_this) {
      return function(authentication) {
        return _this.$(".dimmer").removeClass("active");
      };
    })(this));
  }
});

RMP.remote = new Remote;

RMP.remoteview = new RemoteView({
  model: RMP.remote,
  el: $(".content.remote")
});

RMP.dispatcher.on("loaded:remote", function(page) {
  RMP.remoteview.setElement($(".content.remote"));
  return RMP.remoteview.changeElement();
});

KeyboardController = Backbone.Model.extend({
  defaults: {
    shifted: false
  },
  send: function(command, e) {
    return RMP.dispatcher.trigger(command, e);
  },
  initialize: function() {
    $("body").keyup((function(_this) {
      return function(e) {
        if (_this.get("shifted") === true) {
          if (e.keyCode === 40) {
            _this.send("controls:forward", e);
          } else if (e.keyCode === 39) {
            _this.send("controls:forward", e);
          } else if (e.keyCode === 37) {
            _this.send("controls:backward", e);
          } else if (e.keyCode === 38) {
            _this.send("controls:backward", e);
          }
          if (e.keyCode === 32) {
            _this.send("controls:play", e);
            e.preventDefault();
          }
        }
        if (e.keyCode === 17) {
          return _this.set("shifted", false);
        }
      };
    })(this));
    return $("body").keydown((function(_this) {
      return function(e) {
        if (e.keyCode === 17) {
          return _this.set("shifted", true);
        }
      };
    })(this));
  }
});

RMP.keyboard = new KeyboardController;

//# sourceMappingURL=main.js.map
