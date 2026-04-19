import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, Footprints, Film, UtensilsCrossed, LogIn, LogOut,
  MessageSquare, Heart, Share2, Send, Plus, Search,
  MoreHorizontal, Image as ImageIcon, Calendar, MapPin,
  Trash2, X, CheckCircle2, Info
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

interface Circle {
  id: string;
  name: string;
  description: string;
  icon: string;
  Members?: User[];
  color: string;
  createdAt?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  User: User;
}

interface Post {
  id: string;
  content: string;
  category: string;
  User: User;
  Circle?: Circle;
  Comments: Comment[];
  Likes: { userId: string }[];
  createdAt: string;
}

const CommunityPage = () => {
  const { user: currentUser } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [postCategory, setPostCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  // Circle Creation State
  const [isCircleDialogOpen, setIsCircleDialogOpen] = useState(false);
  const [isExploreDialogOpen, setIsExploreDialogOpen] = useState(false);
  const [newCircleData, setNewCircleData] = useState({
    name: "",
    description: "",
    icon: "Users",
    color: "bg-blue-500/10 text-blue-500"
  });
  const [isCreatingCircle, setIsCreatingCircle] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [circlesRes, postsRes] = await Promise.all([
        fetch("http://127.0.0.1:5000/api/community/circles"),
        fetch("http://127.0.0.1:5000/api/community/posts")
      ]);
      const circlesData = await circlesRes.json();
      const postsData = await postsRes.json();
      setCircles(Array.isArray(circlesData) ? circlesData : []);
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error("Error fetching community data:", error);
      toast.error("Failed to load community feed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCircle = async () => {
    if (!newCircleData.name.trim() || !currentUser) {
      toast.error("Circle name is required");
      return;
    }

    setIsCreatingCircle(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/community/circles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCircleData,
          userId: currentUser.id
        })
      });

      if (response.ok) {
        const createdCircle = await response.json();
        setCircles([...circles, createdCircle]);
        setIsCircleDialogOpen(false);
        setNewCircleData({
          name: "",
          description: "",
          icon: "Users",
          color: "bg-blue-500/10 text-blue-500"
        });
        toast.success("Circle created successfully!");
      } else {
        toast.error("Failed to create circle");
      }
    } catch (error) {
      toast.error("Error creating circle");
    } finally {
      setIsCreatingCircle(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !currentUser) {
      if (!currentUser) toast.error("You must be logged in to post");
      return;
    }

    setIsPosting(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostContent,
          category: postCategory,
          userId: currentUser.id,
          circleId: selectedCircle
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setNewPostContent("");
        setSelectedCircle(null);
        setPostCategory("general");
        toast.success("Post shared with the community!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to share post");
      }
    } catch (error) {
      toast.error("Failed to share post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/community/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(post => {
          if (post.id === postId) {
            const currentLikes = post.Likes || [];
            const newLikes = data.liked
              ? [...currentLikes, { userId: currentUser.id }]
              : currentLikes.filter(l => l.userId !== currentUser.id);
            return { ...post, Likes: newLikes };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;

    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/community/posts/${postId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId));
        toast.success("Post deleted");
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("Error deleting post");
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId];
    if (!content?.trim() || !currentUser) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          userId: currentUser.id,
          postId
        })
      });

      if (response.ok) {
        const addedComment = await response.json();
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              Comments: [...(post.Comments || []), addedComment]
            };
          }
          return post;
        }));
        setNewComment({ ...newComment, [postId]: "" });
      }
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const toggleJoinCircle = async (circleId: string, isJoined: boolean) => {
    if (!currentUser) {
      toast.error("Please login to join circles");
      return;
    }

    try {
      const endpoint = isJoined ? "leave" : "join";
      const response = await fetch(`http://127.0.0.1:5000/api/community/circles/${circleId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (response.ok) {
        toast.success(isJoined ? "Left circle" : "Joined circle!");
        fetchData(); // Refresh to update member lists
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.User.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCircle = !selectedCircle || post.Circle?.id === selectedCircle;
      return matchesSearch && matchesCircle;
    });
  }, [posts, searchQuery, selectedCircle]);

  const getIcon = (name: string) => {
    switch (name) {
      case "Footprints": return <Footprints className="w-5 h-5" />;
      case "Film": return <Film className="w-5 h-5" />;
      case "UtensilsCrossed": return <UtensilsCrossed className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full pb-12 px-4 md:px-6">
      <div className="flex flex-col xl:flex-row gap-4 xl:gap-8">
        {/* Left Column: Feed */}
        <div className="flex-1 space-y-6">
          <header className="mb-8 relative z-10">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Community <span className="text-blue-600">Hub</span></h1>
            <p className="text-slate-500 text-sm">Connect, share, and thrive together with the hostel community.</p>
          </header>

          {/* Create Post Card */}
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl mb-8 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
            <div className="flex gap-4 relative z-10">
                <Avatar className="w-12 h-12 ring-4 ring-primary/10 shadow-lg">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{currentUser?.name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <textarea
                    placeholder="Tell your story or ask a question..."
                    className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60 resize-none min-h-[100px] text-lg leading-relaxed font-medium transition-all"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />

                  {selectedCircle && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 pr-1 pl-3 py-1 gap-2 rounded-full border-none cursor-default">
                      Posting to {circles.find(c => c.id === selectedCircle)?.name}
                      <button onClick={() => setSelectedCircle(null)} className="hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </Badge>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border/20">
                    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                      <Button
                        variant={postCategory === 'general' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={`rounded-full px-4 h-9 font-bold transition-all ${postCategory === 'general' ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-primary'}`}
                        onClick={() => setPostCategory('general')}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" /> General
                      </Button>
                      <Button
                        variant={postCategory === 'event' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={`rounded-full px-4 h-9 font-bold transition-all ${postCategory === 'event' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : 'text-muted-foreground hover:text-orange-500'}`}
                        onClick={() => setPostCategory('event')}
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Event
                      </Button>
                      <Button
                        variant={postCategory === 'help' ? 'secondary' : 'ghost'}
                        size="sm"
                        className={`rounded-full px-4 h-9 font-bold transition-all ${postCategory === 'help' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' : 'text-muted-foreground hover:text-blue-500'}`}
                        onClick={() => setPostCategory('help')}
                      >
                        <Info className="w-4 h-4 mr-2" /> Help
                      </Button>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isPosting}
                      className="px-6 rounded-xl h-9 ml-2 shrink-0 font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                    >
                      {isPosting ? "..." : "Post"} <Send className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
          </Card>

          {/* Filters Bar */}
          {(selectedCircle || searchQuery) && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Filters:</span>
              {selectedCircle && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-full px-3 py-1 gap-1.5">
                  Circle: {circles.find(c => c.id === selectedCircle)?.name}
                  <X className="w-3 h-3 cursor-pointer hover:text-foreground" onClick={() => setSelectedCircle(null)} />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-full px-3 py-1 gap-1.5">
                  Search: "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer hover:text-foreground" onClick={() => setSearchQuery("")} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-muted-foreground hover:text-destructive" onClick={() => { setSelectedCircle(null); setSearchQuery(""); }}>Clear All</Button>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-6">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <Card key={i} className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl">
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </Card>
              ))
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card key={post.id} className={`p-6 bg-white border border-slate-200 shadow-sm rounded-2xl transition-all hover:shadow-md hover:border-slate-300 group/post ${post.category === 'event' ? 'border-orange-200 bg-orange-50/10' : ''}`}>
                  <div className="relative z-10">
                    {post.category === 'event' && <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>}
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex gap-3">
                        <Avatar className="w-11 h-11 ring-2 ring-primary/5 transition-transform group-hover/post:scale-105">
                          <AvatarImage src={post.User?.avatar} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">{post.User?.name?.[0] || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-base">{post.User?.name || 'Unknown'}</span>
                            {post.User?.role === 'admin' && <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] h-4 font-bold tracking-tight">Staff</Badge>}
                            {post.Circle && <Badge variant="outline" className="text-[10px] h-4 border-primary/20 text-primary/80 font-semibold">{post.Circle.name}</Badge>}
                            {post.category === 'help' && <Badge className="bg-blue-500 text-white text-[9px] h-4 px-1.5 uppercase font-black">Seeking Help</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full h-8 w-8 hover:bg-secondary">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl">
                          <DropdownMenuItem className="text-xs font-medium cursor-pointer" onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Link copied!");
                          }}>
                            <Share2 className="w-3.5 h-3.5 mr-2" /> Share Link
                          </DropdownMenuItem>
                          {(currentUser?.id === post.User.id || currentUser?.role === 'admin') && (
                            <DropdownMenuItem className="text-xs font-medium text-destructive cursor-pointer" onClick={() => handleDeletePost(post.id)}>
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Post
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className={`mt-4 text-foreground leading-relaxed font-medium whitespace-pre-wrap ${post.category === 'event' ? 'text-lg italic text-orange-950/90 dark:text-orange-100/90' : 'text-[17px]'}`}>
                      {post.content}
                    </div>

                    {post.category === 'event' && (
                      <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-orange-500/5 to-rose-500/5 border border-orange-500/10 flex items-center gap-5 shadow-sm">
                        <div className="bg-orange-500/10 p-3.5 rounded-2xl text-orange-600 dark:text-orange-400 shadow-inner">
                          <Calendar className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider text-xs mb-1">Upcoming Event</div>
                          <div className="text-sm text-foreground/80 font-bold leading-tight">Join the community activities and connect with your neighbors!</div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-white/50 dark:bg-black/20 border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white font-black rounded-xl transition-all shadow-sm h-10 px-6" onClick={() => toast.success("You're marked as interested!")}>
                          RSVP
                        </Button>
                      </div>
                    )}

                    <div className="mt-8 flex items-center justify-between border-t border-border/30 pt-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`rounded-full px-5 h-10 flex gap-2.5 transition-all ${post.Likes?.some(l => l.userId === currentUser?.id) ? 'text-rose-500 bg-rose-500/10 shadow-inner' : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5'}`}
                        >
                          <Heart className={`w-5 h-5 transition-transform ${post.Likes?.some(l => l.userId === currentUser?.id) ? 'fill-current scale-110' : 'group-hover/post:scale-110'}`} />
                          <span className="text-sm font-bold">{post.Likes?.length || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                          className={`rounded-full px-5 h-10 text-muted-foreground hover:text-primary hover:bg-primary/5 flex gap-2.5 transition-all ${expandedComments[post.id] ? 'bg-primary/10 text-primary' : ''}`}
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm font-bold">{post.Comments?.length || 0}</span>
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success("Link copied!");
                      }}>
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Comments Section */}
                    {expandedComments[post.id] && (
                      <div className="mt-4 pt-4 border-t border-border/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-4">
                          {post.Comments && post.Comments.length > 0 ? (
                            post.Comments.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <Avatar className="w-8 h-8 shrink-0">
                                  <AvatarImage src={comment.User?.avatar} />
                                  <AvatarFallback className="text-[10px] font-bold">{comment.User?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="bg-secondary/40 rounded-2xl px-4 py-2.5 flex-1 ring-1 ring-border/5">
                                  <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-sm font-bold text-foreground">{comment.User?.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-medium">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-[15px] text-foreground/90 font-medium leading-normal">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-sm text-muted-foreground py-2 font-medium">No comments yet. Say something!</p>
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex gap-3 pt-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={currentUser?.avatar} />
                            <AvatarFallback className="text-[10px] font-bold">{currentUser?.name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="relative flex-1">
                            <Input
                              placeholder="Write a comment..."
                              className="rounded-full bg-secondary/30 border-none h-9 text-sm pr-12 focus-visible:ring-1 focus-visible:ring-primary/30"
                              value={newComment[post.id] || ""}
                              onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary disabled:text-muted-foreground/40 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed border-border/50 shadow-inner">
                <div className="bg-secondary w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageSquare className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Feed is empty</h3>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">Be the first to spark a conversation in the community!</p>
                <Button variant="outline" className="mt-8 rounded-full px-8 font-bold border-primary/20 text-primary hover:bg-primary/5" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Post Now
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full xl:w-[340px] space-y-6">
          <div className="sticky top-6">
            {/* Search */}
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-primary/5 blur-xl transition-all group-within:bg-primary/10"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search stories, friends..."
                  className="pl-12 rounded-2xl bg-card/60 border-border/50 h-12 text-[15px] font-medium shadow-sm transition-all focus:shadow-lg focus:bg-card"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Circles Section */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Discovery</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Active Circles</p>
                </div>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-md" onClick={() => setIsCircleDialogOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 relative z-10">
                {circles.map((circle) => {
                  const isJoined = circle.Members?.some(m => m.id === currentUser?.id);
                  return (
                    <div
                      key={circle.id}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer group hover:bg-slate-50 ${selectedCircle === circle.id ? 'bg-slate-50 border-slate-200 shadow-sm text-slate-900' : 'bg-transparent border-transparent text-slate-500'}`}
                      onClick={() => setSelectedCircle(selectedCircle === circle.id ? null : circle.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${circle.color}`}>
                          {getIcon(circle.icon)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{circle.name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {circle.Members?.slice(0, 3).map((m, i) => (
                                <Avatar key={m.id} className="w-4 h-4 border border-background">
                                  <AvatarImage src={m.avatar} />
                                  <AvatarFallback className="text-[6px]">{m.name[0]}</AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-bold">{circle.Members?.length || 0} MEMBERS</span>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-9 w-9 rounded-full transition-all active:scale-90 ${isJoined ? 'text-green-500 bg-green-500/10' : 'opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleJoinCircle(circle.id, !!isJoined);
                          }}
                        >
                          {isJoined ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                className="w-full mt-6 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/5 rounded-xl h-10"
                onClick={() => setIsExploreDialogOpen(true)}
              >
                Explore All
              </Button>
            </Card>

            {/* Premium Info Box */}
            <div className="mt-6 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                  <Info className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Guidelines</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5 relative z-10 font-medium leading-relaxed">Maintain respect and kindness in the community space. No spam or harassment.</p>
              <Button variant="outline" className="w-full rounded-xl text-xs h-9 text-slate-700 transition-all">Read Rules</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Circle Dialog */}
      <Dialog open={isCircleDialogOpen} onOpenChange={setIsCircleDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Create a New Circle</DialogTitle>
            <DialogDescription>
              Build a space for students with shared interests.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-bold text-xs uppercase tracking-widest ml-1">Circle Name</Label>
              <Input
                id="name"
                placeholder="e.g. Midnight Bakers"
                className="rounded-2xl h-12 border-border/50 bg-secondary/30 focus-visible:ring-primary/30"
                value={newCircleData.name}
                onChange={(e) => setNewCircleData({ ...newCircleData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="font-bold text-xs uppercase tracking-widest ml-1">Description</Label>
              <Textarea
                id="description"
                placeholder="What's this circle about?"
                className="rounded-2xl min-h-[100px] border-border/50 bg-secondary/30 focus-visible:ring-primary/30 resize-none"
                value={newCircleData.description}
                onChange={(e) => setNewCircleData({ ...newCircleData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-3">
              <Label className="font-bold text-xs uppercase tracking-widest ml-1">Choose Style</Label>
              <div className="flex gap-3">
                {[
                  { icon: 'Users', color: 'bg-blue-500/10 text-blue-500' },
                  { icon: 'Footprints', color: 'bg-green-500/10 text-green-500' },
                  { icon: 'Film', color: 'bg-purple-500/10 text-purple-500' },
                  { icon: 'UtensilsCrossed', color: 'bg-orange-500/10 text-orange-500' }
                ].map((style, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewCircleData({ ...newCircleData, icon: style.icon, color: style.color })}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${style.color} ${newCircleData.icon === style.icon ? 'ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                  >
                    {getIcon(style.icon)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full rounded-2xl h-12 font-black uppercase tracking-widest"
              onClick={handleCreateCircle}
              disabled={isCreatingCircle}
            >
              {isCreatingCircle ? "Creating..." : "Create Circle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Explore All Circles Dialog */}
      <Dialog open={isExploreDialogOpen} onOpenChange={setIsExploreDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[32px] border-none shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="px-1">
            <DialogTitle className="text-3xl font-black">All Circles</DialogTitle>
            <DialogDescription className="text-base font-medium">
              Discover and join communities within your hostel.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4 scrollbar-hide">
            {circles.map((circle) => {
              const isJoined = circle.Members?.some(m => m.id === currentUser?.id);
              return (
                <Card key={circle.id} className="p-5 border-none shadow-md bg-secondary/20 hover:bg-secondary/40 transition-all rounded-3xl group">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${circle.color}`}>
                      {getIcon(circle.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-foreground">{circle.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 font-medium leading-snug">{circle.description || "A community for hostel residents."}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-2">
                          {circle.Members?.slice(0, 5).map(m => (
                            <Avatar key={m.id} className="w-5 h-5 border-2 border-background">
                              <AvatarImage src={m.avatar} />
                              <AvatarFallback className="text-[7px]">{m.name[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-primary/80 uppercase tracking-tighter">{circle.Members?.length || 0} Members</span>
                      </div>
                    </div>
                    <Button
                      variant={isJoined ? "outline" : "default"}
                      className={`rounded-2xl px-6 h-10 font-bold transition-all ${isJoined ? 'border-primary/20 text-primary hover:bg-destructive hover:text-white group' : ''}`}
                      onClick={() => toggleJoinCircle(circle.id, !!isJoined)}
                    >
                      {isJoined ? <span className="group-hover:hidden">Joined</span> : "Join"}
                      {isJoined && <span className="hidden group-hover:inline">Leave</span>}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          <DialogFooter className="border-t border-border/20 pt-4 px-1">
            <Button variant="ghost" className="w-full rounded-2xl h-12 font-black uppercase tracking-widest" onClick={() => setIsExploreDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityPage;
