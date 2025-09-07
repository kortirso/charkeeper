# frozen_string_literal: true

class Homebrew
  class Race < ApplicationRecord
    belongs_to :user

    has_many :homebrews, as: :brewery, dependent: :destroy
    has_many :homebrew_book_items, class_name: 'Homebrew::Book::Item', as: :itemable, dependent: :destroy
  end
end
