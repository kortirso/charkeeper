# frozen_string_literal: true

class User
  class Book < ApplicationRecord
    belongs_to :user
    belongs_to :book, class_name: 'Homebrew::Book', foreign_key: :homebrew_book_id
  end
end
