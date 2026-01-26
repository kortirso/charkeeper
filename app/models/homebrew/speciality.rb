# frozen_string_literal: true

class Homebrew
  class Speciality < ApplicationRecord
    include Discard::Model

    belongs_to :user, touch: :homebrew_updated_at
  end
end
