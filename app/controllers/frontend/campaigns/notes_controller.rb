# frozen_string_literal: true

module Frontend
  module Campaigns
    class NotesController < Frontend::NotesController
      private

      def noteable
        Campaign.find(params.expect(:campaign_id))
      end
    end
  end
end
