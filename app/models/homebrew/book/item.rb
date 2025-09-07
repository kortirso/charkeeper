# frozen_string_literal: true

class Homebrew
  class Book
    class Item < ApplicationRecord
      belongs_to :homebrew_book, class_name: 'Homebrew::Book'
      belongs_to :itemable, polymorphic: true
    end
  end
end
