# frozen_string_literal: true

class Homebrew < ApplicationRecord
  include Discard::Model
  include Upvoteable
  include Homebrewable

  belongs_to :user, touch: :homebrew_updated_at
  belongs_to :homebrew, optional: true

  has_many :homebrews, dependent: :destroy
end
