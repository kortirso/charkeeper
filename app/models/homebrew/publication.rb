# frozen_string_literal: true

class Homebrew
  class Publication < ApplicationRecord
    has_one_attached :file

    belongs_to :user
  end
end
