# frozen_string_literal: true

module HomebrewsV2
  class PublicationSerializer < ApplicationSerializer
    attributes :id, :errors_list, :completed_at

    def completed_at
      object.completed_at&.strftime('%Y-%m-%d %H:%M')
    end
  end
end
