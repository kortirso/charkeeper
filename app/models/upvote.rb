# frozen_string_literal: true

class Upvote < ApplicationRecord
  belongs_to :user
  belongs_to :upvoteable, polymorphic: true, counter_cache: :upvotes_count
end
