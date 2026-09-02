# frozen_string_literal: true

module Frontend
  module Characters
    class ImportController < Frontend::BaseController
      include SerializeResource

      DND_SERIALIZE_FIELDS = %i[id name level race subrace species legacy classes provider avatar].freeze

      # rubocop: disable-next Rails/StrongParametersExpect
      def create
        case character_import.call(
          user: current_user, provider: params[:provider], service: params[:service], data: params[:data].permit!.to_h
        )
        in { errors: errors, errors_list: errors_list } then unprocessable_response(errors, errors_list)
        in { result: result }
          serialize_resource(result, serializer(result.type), :character, { only: serialize_fields(result.type) }, :created)
        end
      end

      private

      def character_import = ImportContext::Upload.new

      def serializer(character_type)
        "#{character_type}Serializer".constantize
      end

      def serialize_fields(character_type)
        case character_type
        when 'Dnd5::Character', 'Dnd2024::Character', 'Pathfinder2::Character' then DND_SERIALIZE_FIELDS
        end
      end
    end
  end
end
