FROM ruby:2.7-alpine

WORKDIR /app  
ADD Gemfile /app
ADD Gemfile.lock /app
RUN apk --update add --virtual build-dependencies ruby-dev build-base bash && \  
    gem install bundler -v 2.1.4 && \
    bundle install --without development test && \
    apk del build-dependencies

ENV RACK_ENV production

ADD . /app

ENTRYPOINT ["bundle", "exec", "ruby", "app.rb"]
CMD ["-p", "8080", "-o", "0.0.0.0"]