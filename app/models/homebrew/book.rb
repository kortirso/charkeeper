# frozen_string_literal: true

class Homebrew
  class Book < ApplicationRecord
    belongs_to :user

    has_many :items, class_name: 'Homebrew::Book::Item', foreign_key: :homebrew_book_id, dependent: :destroy
    has_many :user_books, class_name: 'User::Book', foreign_key: :homebrew_book_id, dependent: :destroy

    scope :shared, -> { where(shared: true).or(where(public: true)) }
  end
end
