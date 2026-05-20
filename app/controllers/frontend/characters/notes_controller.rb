# frozen_string_literal: true

module Frontend
  module Characters
    class NotesController < Frontend::NotesController
      private

      def noteable
        authorized_scope(Character.all).find(params.expect(:character_id))
      end
    end
  end
end
