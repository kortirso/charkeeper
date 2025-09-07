# frozen_string_literal: true

class Homebrew
  class Book < ApplicationRecord
    belongs_to :user

    has_many :items, class_name: 'Homebrew::Book::Item', foreign_key: :homebrew_book_id, dependent: :destroy
  end
end
