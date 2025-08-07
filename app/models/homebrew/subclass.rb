# frozen_string_literal: true

class Homebrew
  class Subclass < ApplicationRecord
    belongs_to :user
  end
end
