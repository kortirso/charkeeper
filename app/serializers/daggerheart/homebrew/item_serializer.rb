# frozen_string_literal: true

module Daggerheart
  module Homebrew
    class ItemSerializer < ApplicationSerializer
      attributes :id, :name, :kind, :info, :itemable_id, :itemable_type
    end
  end
end
