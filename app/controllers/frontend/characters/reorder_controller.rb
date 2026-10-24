# frozen_string_literal: true

module Frontend
  module Characters
    class ReorderController < Frontend::BaseController
      include SerializeResource

      def create
        reorder_payload = find_reorder_payload
        if reorder_payload.any?
          Character.upsert_all(
            reorder_payload,
            unique_by: :id, update_only: %i[position], record_timestamps: true
          )
        end

        render json: { result: :ok }
      end

      private

      def find_reorder_payload # rubocop: disable Metrics/AbcSize
        characters = current_user.characters.parents.where(id: params[:character_ids]).index_by { |item| item.id.to_s }
        items_index = 0

        params[:character_ids].uniq.filter_map do |id| # rubocop: disable Rails/StrongParametersExpect
          character = characters[id]
          next unless character

          items_index += 1
          {
            id: character.id,
            position: items_index - 1,
            name: character.name,
            type: character.type,
            user_id: character.user_id
          }
        end
      end
    end
  end
end
