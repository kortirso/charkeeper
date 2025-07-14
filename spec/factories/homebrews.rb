# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew do
    user
    brewery factory: :homebrew_race
  end
end
