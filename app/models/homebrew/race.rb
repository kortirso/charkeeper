# frozen_string_literal: true

class Homebrew
  class Race < ApplicationRecord
    belongs_to :user, touch: :homebrew_updated_at

    has_many :homebrew_book_items, class_name: 'Homebrew::Book::Item', as: :itemable, dependent: :destroy
  end
end
