import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Tags, Filter, CheckCircle2, Star, Upload, Sparkles, Heart, Users } from "lucide-react";
import { Button } from "../components/ui/button";

export function WelcomePage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-10 sm:py-14">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <img
          src="/KPopCollectLogo.svg"
          alt="KPop Collect"
          className="h-28 w-auto sm:h-36 mb-6"
        />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Your K-pop photocard collection, finally organized.
        </h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
          Tag, filter, and search every card in your collection. Mark what you own,
          build a wishlist of what you're chasing, and leave the messy screenshots
          and spreadsheets behind.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <Link to="/gallery">Browse the gallery</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/admin">Upload a card</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16 sm:mt-20">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-foreground">
          How it works
        </h2>
        <p className="mt-3 text-center text-muted-foreground max-w-xl mx-auto">
          Three simple ideas power the whole site: tags, filters, and your personal
          collection.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Tags className="h-5 w-5" />}
            title="Tag every card"
            body="Every card is labeled with structured tags — group, member, album, version, year, card number — plus any custom tags you want to add. Tags are how the site understands your collection."
          />
          <FeatureCard
            icon={<Filter className="h-5 w-5" />}
            title="Filter and search"
            body="Stack any combination of tags to narrow the gallery. Want every Jungkook card from 2020? Two clicks. Searching by a member name, an album, or a note? The search bar checks all of it."
          />
          <FeatureCard
            icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            title="Mark as collected"
            body="Tap the green check on any card to mark it as yours. Your collection is saved in your browser, so it's waiting for you the next time you come back."
          />
          <FeatureCard
            icon={<Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
            title="Build a wishlist"
            body="Tap the star to add a card to your wishlist. Great for tracking the ones you're hunting, planning trades, or saving the pulls you want next."
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5 text-primary" />}
            title="Mobile-friendly"
            body="Pull it up on your phone while you're at a pop-up, browsing a reseller's feed, or sorting cards on the floor. The site works the same on desktop and mobile."
          />
          <FeatureCard
            icon={<Upload className="h-5 w-5" />}
            title="Grows with you"
            body="Don't see a card you need? Upload it yourself from the Admin page — once it's in, anyone can filter and track it."
          />
        </div>
      </section>

      {/* Uploading cards */}
      <section className="mt-16 sm:mt-20">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <Upload className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Uploading a card
            </span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-foreground">
            Add a new card in a few clicks
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Head to the <Link to="/admin" className="text-primary underline-offset-4 hover:underline">Admin page</Link> and
            use the single card upload form:
          </p>
          <ol className="mt-5 space-y-3 text-sm sm:text-base text-foreground max-w-2xl">
            <Step n={1}>
              <strong>Pick an image.</strong> Drop in a clean photo or scan of the
              card. You can crop it to the standard photocard ratio right in the
              upload form.
            </Step>
            <Step n={2}>
              <strong>Choose tags.</strong> Select a group, member, album,
              version, year — whatever applies. Don't see the tag you need?
              Create it on the spot.
            </Step>
            <Step n={3}>
              <strong>Add card number and notes (optional).</strong> Drop in the
              official card number and any details — edition, inclusion, where it
              came from.
            </Step>
            <Step n={4}>
              <strong>Save.</strong> The card shows up in the gallery right
              away, fully filterable by everyone.
            </Step>
          </ol>
        </div>
      </section>

      {/* About the author + future goals */}
      <section className="mt-16 sm:mt-20 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              About the author
            </span>
          </div>
          <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-foreground">
            Hi, I'm Krista 👋
          </h3>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            I run{" "}
            <a
              href="https://instagram.com/mittencarats"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              @mittencarats
            </a>{" "}
            on Instagram and have been collecting K-pop photocards for a while.
            Like a lot of fans, I got tired of juggling PDF templates,
            screenshot folders full of scribbles, and the spreadsheet-of-the-month
            just to track what I owned and what I was chasing. Every collector I
            know has a dozen versions of "the list" and none of them ever match.
          </p>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            KPop Collect is my attempt at a single, tidy home for all of it —
            a real gallery with tags, filters, and a proper collected /
            wishlist toggle, instead of a screenshot graveyard.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              What's coming next
            </span>
          </div>
          <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-foreground">
            Where the site is headed
          </h3>
          <ul className="mt-4 space-y-4 text-sm sm:text-base text-muted-foreground">
            <li className="flex gap-3">
              <Star className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <span>
                <strong className="text-foreground">Custom, named wishlists.</strong>{" "}
                Make as many as you want — a list per group or member, a "grails"
                list for the rare-and-expensive, a casual "trade bait" list for
                commons. Name them however you like.
              </span>
            </li>
            <li className="flex gap-3">
              <Users className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <span>
                <strong className="text-foreground">Public profiles.</strong>{" "}
                Personal bio, links to your other socials, and a space that
                feels like yours.
              </span>
            </li>
            <li className="flex gap-3">
              <Heart className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <span>
                <strong className="text-foreground">Browse and comment.</strong>{" "}
                View other collectors' public wishlists, leave comments when
                you have a card they want, and set up trades without leaving
                the site.
              </span>
            </li>
          </ul>
          <p className="mt-5 text-xs text-muted-foreground">
            Still early days — the MVP lives in your browser. Accounts and
            community features are next on the list.
          </p>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mt-16 sm:mt-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
          Ready to start?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Jump into the gallery and start tagging what's yours.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link to="/gallery">Browse the gallery</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
        {n}
      </span>
      <span className="pt-0.5 text-muted-foreground">{children}</span>
    </li>
  );
}
