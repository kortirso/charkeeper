# frozen_string_literal: true

class Homebrew
  class Book < ApplicationRecord
    belongs_to :user
  end
end
