# frozen_string_literal: true

class Homebrew
  class Speciality < ApplicationRecord
    belongs_to :user
  end
end
