# frozen_string_literal: true

module Itemable
  extend ActiveSupport::Concern

  included do
    has_many :items, as: :itemable, dependent: :destroy
  end
end
