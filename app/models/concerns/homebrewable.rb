# frozen_string_literal: true

module Homebrewable
  extend ActiveSupport::Concern

  included do
    has_many :homebrew_book_items, class_name: 'Homebrew::Book::Item', as: :itemable, dependent: :destroy
    has_many :homebrew_books, through: :homebrew_book_items
  end
end
