# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class Domain < ApplicationRecord
      self.table_name = :daggerheart_homebrew_domains

      belongs_to :user

      has_many :homebrew_book_items, class_name: 'Homebrew::Book::Item', as: :itemable, dependent: :destroy
    end
  end
end
