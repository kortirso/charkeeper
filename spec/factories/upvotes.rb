# frozen_string_literal: true

FactoryBot.define do
  factory :upvote do
    user
    upvoteable factory: :homebrew_community
  end
end
