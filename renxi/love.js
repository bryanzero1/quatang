(function(window){

    function random(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function bezier(cp, t) {  
        var p1 = cp[0].mul((1 - t) * (1 - t));
        var p2 = cp[1].mul(2 * t * (1 - t));
        var p3 = cp[2].mul(t * t); 
        return p1.add(p2).add(p3);
    }  

    function inheart(x, y, r) {
        // x^2+(y-(x^2)^(1/3))^2 = 1
        // http://www.wolframalpha.com/input/?i=x%5E2%2B%28y-%28x%5E2%29%5E%281%2F3%29%29%5E2+%3D+1
        var z = ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) - (x / r) * (x / r) * (y / r) * (y / r) * (y / r);
        return z < 0;
    }

    Point = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Point.prototype = {
        clone: function() {
            return new Point(this.x, this.y);
        },
        add: function(o) {
            p = this.clone();
            p.x += o.x;
            p.y += o.y;
            return p;
        },
        sub: function(o) {
            p = this.clone();
            p.x -= o.x;
            p.y -= o.y;
            return p;
        },
        div: function(n) {
            p = this.clone();
            p.x /= n;
            p.y /= n;
            return p;
        },
        mul: function(n) {
            p = this.clone();
            p.x *= n;
            p.y *= n;
            return p;
        }
    }

    Heart = function() {
        // Enhanced cute heart shape with multiple curves
        // Using parametric equations for a more adorable heart
        var points = [], x, y, t;
        
        // First curve - main heart body (more rounded and cute)
        for (var i = 0; i < 62.8; i += 0.15) {
            t = i / 10;
            // Modified heart equation for cuter shape
            x = 16 * Math.pow(Math.sin(t), 3) * 1.2;
            y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 1.1;
            points.push(new Point(x, y));
        }
        
        // Add extra points for smoother, rounder curves
        for (var i = 0; i < 31.4; i += 0.1) {
            t = i / 5;
            x = 14 * Math.pow(Math.sin(t), 3) * 1.3;
            y = (12 * Math.cos(t) - 4 * Math.cos(2 * t) - 1.5 * Math.cos(3 * t) - 0.5 * Math.cos(4 * t)) * 1.2;
            points.push(new Point(x * 0.9, y * 0.9));
        }
        
        this.points = points;
        this.length = points.length;
    }
    Heart.prototype = {
        get: function(i, scale) {
            return this.points[i].mul(scale || 1);
        }
    }

    Seed = function(tree, point, scale, color) {
        this.tree = tree;

        var scale = scale || 1
        var color = color || '#FF0000';

        this.heart = {
            point  : point,
            scale  : scale,
            color  : color,
            figure : new Heart(),
        }

        this.cirle = {
            point  : point,
            scale  : scale,
            color  : color,
            radius : 5,
        }
        
        this.hidden = false; // Add hidden state
    }
    Seed.prototype = {
        draw: function() {
            // Only draw if not hidden and scale is significant
            if (!this.hidden && this.heart.scale > 0.01) {
                this.drawHeart();
                this.drawText();
            }
        },
        addPosition: function(x, y) {
            this.cirle.point = this.cirle.point.add(new Point(x, y));
        },
        canMove: function() {
            return !this.hidden && this.cirle.point.y < (this.tree.height + 20); 
        },
        move: function(x, y) {
            this.clear();
            if (!this.hidden) {
                this.drawCirle();
            }
            this.addPosition(x, y);
        },
        canScale: function() {
            return !this.hidden && this.heart.scale > 0.01; // Allow scaling down to nearly 0
        },
        setHeartScale: function(scale) {
            this.heart.scale *= scale;
        },
        scale: function(scale) {
            this.clear();
            if (!this.hidden) {
                this.drawCirle();
                this.drawHeart();
            }
            this.setHeartScale(scale);
        },
        drawHeart: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, 
                scale = heart.scale;
            
            // Don't draw if hidden or scale is too small
            if (this.hidden || scale <= 0.01) return;
                
            ctx.save();
            
            // Create gradient for cute heart
            var gradient = ctx.createRadialGradient(0, -10, 5, 0, 0, 40);
            gradient.addColorStop(0, '#ff69b4');
            gradient.addColorStop(0.3, '#ff1493');
            gradient.addColorStop(0.7, '#ffc0cb');
            gradient.addColorStop(1, '#ff69b4');
            
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#ff1493';
            ctx.lineWidth = 2;
            
            // Add shadow for depth
            ctx.shadowColor = 'rgba(255, 105, 180, 0.6)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 5;
            
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < heart.figure.length; i++) {
                var p = heart.figure.get(i, scale);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Add cute shine effect
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.ellipse(-8, -15, 4, 7, -0.3, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.ellipse(5, -12, 3, 5, 0.2, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.restore();
        },
        drawCirle: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, color = cirle.color, 
                scale = cirle.scale, radius = cirle.radius;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.moveTo(0, 0);
    	    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawText: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, 
                scale = heart.scale;
            
            // Don't draw text if hidden or scale is too small
            if (this.hidden || scale <= 0.01) return;
                
            ctx.save();
            
            // Create gradient for text
            var textGradient = ctx.createLinearGradient(0, 0, 100, 0);
            textGradient.addColorStop(0, '#ff1493');
            textGradient.addColorStop(0.5, '#ff69b4');
            textGradient.addColorStop(1, '#ffc0cb');
            
            ctx.strokeStyle = textGradient;
            ctx.fillStyle = textGradient;
            ctx.lineWidth = 2;
            
            // Add glow effect for text
            ctx.shadowColor = 'rgba(255, 105, 180, 0.8)';
            ctx.shadowBlur = 10;
            
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            
            // Draw cute arrow with curved line
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(8, 8, 15, 15);
            ctx.lineTo(60, 15);
            ctx.stroke();
            
            // Add arrow head with cute style
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(8, -3);
            ctx.lineTo(8, 3);
            ctx.closePath();
            ctx.fill();

            ctx.moveTo(0, 0);
            ctx.scale(0.8, 0.8);
            ctx.font = "bold 14px 'Dancing Script', 'Microsoft YaHei', sans-serif";
            ctx.fillText("💕 Click Me 💕", 25, 12);
            
            // Add cute sparkle effects around text - positioned to not overlap
            ctx.font = "10px Arial";
            ctx.fillText("✨", 15, 2);  // Moved left and up
            ctx.fillText("✨", 75, 8);  // Moved right
            ctx.fillText("⭐", 45, -8); // Moved right and up more to avoid overlap
            
            ctx.restore();
        },
        clear: function() {
            var ctx = this.tree.ctx, heart = this.heart, cirle = this.cirle;
            var point = heart.point, scale = heart.scale;
            // Clear much larger area to completely remove heart, text, emojis and all effects
            var clearRadius = this.hidden ? 200 : 80 * scale; // Even larger when hidden
            var w = h = clearRadius;
            ctx.clearRect(point.x - w, point.y - w, 2 * w, 2 * w);
            
            // Additional clear for text area (since text might extend beyond heart area)
            if (this.hidden) {
                ctx.clearRect(point.x - 100, point.y - 50, 200, 100);
            }
        },
        hide: function() {
            // Completely hide the heart by setting scale to 0 and clearing multiple times
            this.hidden = true;
            this.heart.scale = 0;
            this.cirle.scale = 0;
            
            // Clear multiple times with different areas to ensure complete removal
            this.clear();
            
            // Additional aggressive clearing
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point;
            ctx.clearRect(point.x - 200, point.y - 100, 400, 200);
            
            // Force a redraw of the area to ensure nothing remains
            setTimeout(() => {
                ctx.clearRect(point.x - 200, point.y - 100, 400, 200);
            }, 10);
        },
        hover: function(x, y) {
            // Don't allow hover if hidden
            if (this.hidden) return false;
            
            var ctx = this.tree.ctx;
            var pixel = ctx.getImageData(x, y, 1, 1);
            return pixel.data[3] == 255
        }
    }

    Footer = function(tree, width, height, speed) {
        this.tree = tree;
        this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
        this.width = width;
        this.height = height;
        this.speed = speed || 2;
        this.length = 0;
    }
    Footer.prototype = {
        draw: function() {
            var ctx = this.tree.ctx, point = this.point;
            var len = this.length / 2;

            ctx.save();
            ctx.strokeStyle = 'rgb(35, 31, 32)';
            ctx.lineWidth = this.height;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
    	    ctx.lineTo(len, 0);
    	    ctx.lineTo(-len, 0);
            ctx.stroke();
            ctx.restore();

            if (this.length < this.width) {
                this.length += this.speed;
            }
        }
    }

    Tree = function(canvas, width, height, opt) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.opt = opt || {};

        this.record = {};
        
        this.initSeed();
        this.initFooter();
        this.initBranch();
        this.initBloom();
    }
    Tree.prototype = {
        initSeed: function() {
            var seed = this.opt.seed || {};
            var x = seed.x || this.width / 2;
            var y = seed.y || this.height / 2;
            var point = new Point(x, y);
            var color = seed.color || '#FF0000';
            var scale = seed.scale || 1;

            this.seed = new Seed(this, point, scale, color);
        },

        initFooter: function() {
            var footer = this.opt.footer || {};
            var width = footer.width || this.width;
            var height = footer.height || 5;
            var speed = footer.speed || 2;
            this.footer = new Footer(this, width, height, speed);
        },

        initBranch: function() {
            var branchs = this.opt.branch || []
            this.branchs = [];
            this.addBranchs(branchs);
        },

        initBloom: function() {
            var bloom = this.opt.bloom || {};
            var cache = [],
                num = bloom.num || 500, 
                width = bloom.width || this.width,
                height = bloom.height || this.height,
                figure = this.seed.heart.figure;
            var r = 240, x, y;
            for (var i = 0; i < num; i++) {
                cache.push(this.createBloom(width, height, r, figure));
            }
            this.blooms = [];
            this.bloomsCache = cache;
        },

        toDataURL: function(type) {
            return this.canvas.toDataURL(type);
        },

        draw: function(k) {
            var s = this, ctx = s.ctx;
            var rec = s.record[k];
            if (!rec) {
                return ;
            }
            var point = rec.point,
                image = rec.image;

            ctx.save();
            ctx.putImageData(image, point.x, point.y);
        	ctx.restore();
        },

        addBranch: function(branch) {
        	this.branchs.push(branch);
        },

        addBranchs: function(branchs){
            var s = this, b, p1, p2, p3, r, l, c;
        	for (var i = 0; i < branchs.length; i++) {
                b = branchs[i];
                p1 = new Point(b[0], b[1]);
                p2 = new Point(b[2], b[3]);
                p3 = new Point(b[4], b[5]);
                r = b[6];
                l = b[7];
                c = b[8]
                s.addBranch(new Branch(s, p1, p2, p3, r, l, c)); 
            }
        },

        removeBranch: function(branch) {
            var branchs = this.branchs;
        	for (var i = 0; i < branchs.length; i++) {
        		if (branchs[i] === branch) {
        			branchs.splice(i, 1);
                }
            }
        },

        canGrow: function() {
            return !!this.branchs.length;
        },
        grow: function() {
            var branchs = this.branchs;
    	    for (var i = 0; i < branchs.length; i++) {
                var branch = branchs[i];
                if (branch) {
                    branch.grow();
                }
            }
        },

        addBloom: function (bloom) {
            this.blooms.push(bloom);
        },

        removeBloom: function (bloom) {
            var blooms = this.blooms;
            for (var i = 0; i < blooms.length; i++) {
                if (blooms[i] === bloom) {
                    blooms.splice(i, 1);
                }
            }
        },

        createBloom: function(width, height, radius, figure, color, alpha, angle, scale, place, speed) {
            var x, y;
            while (true) {
                x = random(20, width - 20);
                y = random(20, height - 20);
                if (inheart(x - width / 2, height - (height - 40) / 2 - y, radius)) {
                    return new Bloom(this, new Point(x, y), figure, color, alpha, angle, scale, place, speed);
                }
            }
        },
        
        canFlower: function() {
            return !!this.blooms.length;
        }, 
        flower: function(num) {
            var s = this, blooms = s.bloomsCache.splice(0, num);
            for (var i = 0; i < blooms.length; i++) {
                s.addBloom(blooms[i]);
            }
            blooms = s.blooms;
            for (var j = 0; j < blooms.length; j++) {
                blooms[j].flower();
            }
        },

        snapshot: function(k, x, y, width, height) {
            var ctx = this.ctx;
            var image = ctx.getImageData(x, y, width, height); 
            this.record[k] = {
                image: image,
                point: new Point(x, y),
                width: width,
                height: height
            }
        },
        setSpeed: function(k, speed) {
            this.record[k || "move"].speed = speed;
        },
        move: function(k, x, y) {
            var s = this, ctx = s.ctx;
            var rec = s.record[k || "move"];
            var point = rec.point,
                image = rec.image,
                speed = rec.speed || 10,
                width = rec.width,
                height = rec.height; 

            i = point.x + speed < x ? point.x + speed : x;
            j = point.y + speed < y ? point.y + speed : y; 

            ctx.save();
            ctx.clearRect(point.x, point.y, width, height);
            ctx.putImageData(image, i, j);
        	ctx.restore();

            rec.point = new Point(i, j);
            rec.speed = speed * 0.95;

            if (rec.speed < 2) {
                rec.speed = 2;
            }
            return i < x || j < y;
        },

        jump: function() {
            var s = this, blooms = s.blooms;
            if (blooms.length) {
                for (var i = 0; i < blooms.length; i++) {
                    blooms[i].jump();
                }
            } 
            if ((blooms.length && blooms.length < 3) || !blooms.length) {
                var bloom = this.opt.bloom || {},
                    width = bloom.width || this.width,
                    height = bloom.height || this.height,
                    figure = this.seed.heart.figure;
                var r = 240, x, y;
                for (var i = 0; i < random(1,2); i++) {
                    blooms.push(this.createBloom(width / 2 + width, height, r, figure, null, 1, null, 1, new Point(random(-100,600), 720), random(200,300)));
                }
            }
        }
    }

    Branch = function(tree, point1, point2, point3, radius, length, branchs) {
        this.tree = tree;
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
        this.radius = radius;
        this.length = length || 100;    
        this.len = 0;
        this.t = 1 / (this.length - 1);   
        this.branchs = branchs || [];
    }

    Branch.prototype = {
        grow: function() {
            var s = this, p; 
            if (s.len <= s.length) {
                p = bezier([s.point1, s.point2, s.point3], s.len * s.t);
                s.draw(p);
                s.len += 1;
                s.radius *= 0.97;
            } else {
                s.tree.removeBranch(s);
                s.tree.addBranchs(s.branchs);
            }
        },
        draw: function(p) {
            var s = this;
            var ctx = s.tree.ctx;
            ctx.save();
        	ctx.beginPath();
        	ctx.fillStyle = 'rgb(35, 31, 32)';
            ctx.shadowColor = 'rgb(35, 31, 32)';
            ctx.shadowBlur = 2;
        	ctx.moveTo(p.x, p.y);
        	ctx.arc(p.x, p.y, s.radius, 0, 2 * Math.PI);
        	ctx.closePath();
        	ctx.fill();
        	ctx.restore();
        }
    }

    Bloom = function(tree, point, figure, color, alpha, angle, scale, place, speed) {
        this.tree = tree;
        this.point = point;
        this.color = color || 'rgb(255,' + random(0, 255) + ',' + random(0, 255) + ')';
        this.alpha = alpha || random(0.3, 1);
        this.angle = angle || random(0, 360);
        this.scale = scale || 0.1;
        this.place = place;
        this.speed = speed;

        this.figure = figure;
    }
    Bloom.prototype = {
        setFigure: function(figure) {
            this.figure = figure;
        },
        flower: function() {
            var s = this;
            s.draw();
            s.scale += 0.1;
            if (s.scale > 1) {
                s.tree.removeBloom(s);
            }
        },
        draw: function() {
            var s = this, ctx = s.tree.ctx, figure = s.figure;

            ctx.save();
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.translate(s.point.x, s.point.y);
            ctx.scale(s.scale, s.scale);
            ctx.rotate(s.angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < figure.length; i++) {
                var p = figure.get(i);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        jump: function() {
            var s = this, height = s.tree.height;

            if (s.point.x < -20 || s.point.y > height + 20) {
                s.tree.removeBloom(s);
            } else {
                s.draw();
                s.point = s.place.sub(s.point).div(s.speed).add(s.point);
                s.angle += 0.05;
                s.speed -= 1;
            }
        }
    }

    window.random = random;
    window.bezier = bezier;
    window.Point = Point;
    window.Tree = Tree;

})(window);
