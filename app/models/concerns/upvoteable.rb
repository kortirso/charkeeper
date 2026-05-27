# frozen_string_literal: true

module Upvoteable
  extend ActiveSupport::Concern

  included do
    has_many :upvotes, as: :upvoteable, dependent: :destroy
  end
end
