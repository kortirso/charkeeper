# frozen_string_literal: true

class Homebrew
  class Community < ApplicationRecord
    include Discard::Model

    belongs_to :user, touch: :homebrew_updated_at

    has_many :homebrew_book_items, class_name: 'Homebrew::Book::Item', as: :itemable, dependent: :destroy
  end
end
