# frozen_string_literal: true

class Homebrew
  class Subclass < ApplicationRecord
    belongs_to :user

    has_many :homebrew_book_items, class_name: 'Homebrew::Book::Item', as: :itemable, dependent: :destroy
  end
end
