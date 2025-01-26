# frozen_string_literal: true

class User
  class Character < ApplicationRecord
    DND5 = 'DnD 5'

    belongs_to :user, touch: true
    belongs_to :characterable, polymorphic: true

    enum :provider, { DND5 => 0 }
  end
end
