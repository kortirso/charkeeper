# frozen_string_literal: true

FactoryBot.define do
  factory :homebrew_publication, class: 'Homebrew::Publication' do
    parent_type { '' }
    user
  end
end
