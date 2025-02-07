# frozen_string_literal: true

class Character
  class Note < ApplicationRecord
    belongs_to :character, class_name: '::Character', touch: true
  end
end
