# frozen_string_literal: true

module NotesContext
  class AddCommand < BaseCommand
    use_contract do
      config.messages.namespace = :note

      params do
        required(:noteable).filled(type_included_in?: [::Character, ::Campaign])
        required(:title).filled(:string, max_size?: 50)
        required(:value).filled(:string, max_size?: 500)
      end
    end

    private

    def do_prepare(input)
      input[:value] = sanitize(input[:value])
    end

    def do_persist(input)
      result = input[:noteable].notes.create!(input.except(:noteable))

      { result: result }
    end
  end
end
