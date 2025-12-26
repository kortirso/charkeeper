# frozen_string_literal: true

class Homebrew
  class Speciality < ApplicationRecord
    belongs_to :user, touch: :homebrew_updated_at
  end
end
