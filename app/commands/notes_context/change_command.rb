# frozen_string_literal: true

module NotesContext
  class ChangeCommand < BaseCommand
    use_contract do
      config.messages.namespace = :note

      params do
        required(:note).filled(type_included_in?: [::Character::Note, ::Campaign::Note])
        optional(:title).filled(:string, max_size?: 50)
        optional(:value).filled(:string, max_size?: 500)
      end
    end

    private

    def do_prepare(input)
      input[:value] = sanitize(input[:value]) if input[:value]
    end

    def do_persist(input)
      input[:note].update!(input.except(:note))

      { result: input[:note] }
    end
  end
end
