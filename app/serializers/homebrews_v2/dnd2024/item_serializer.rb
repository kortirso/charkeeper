# frozen_string_literal: true

module HomebrewsV2
  module Dnd2024
    class ItemSerializer < ApplicationSerializer
      attributes :id, :info, :kind
    end
  end
end
