FROM ruby:2.7

RUN bundle config --global frozen 1

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY ./ .

CMD ["bundle", "exec", "ruby", "consumer.rb"]