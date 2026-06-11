# frozen_string_literal: true

class Homebrew < ApplicationRecord
  include Discard::Model
  include Upvoteable

  belongs_to :user, touch: :homebrew_updated_at

  has_many :homebrew_book_items, class_name: 'Homebrew::Book::Item', as: :itemable, dependent: :destroy
end
