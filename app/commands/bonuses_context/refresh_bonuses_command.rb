# frozen_string_literal: true

module BonusesContext
  class RefreshBonusesCommand < BaseCommand
    use_contract do
      config.messages.namespace = :bonus

      params do
        required(:bonusable).filled(type?: ::Feat)
        optional(:bonuses).maybe(:array).each(:hash) do
          required(:id).filled(type_included_in?: [Integer, String])
          required(:type).filled(:string)
          required(:value)
        end
      end
    end

    private

    def do_prepare(input)
      existing_ids = input[:bonusable].bonuses.pluck(:id)
      current_ids = input[:bonuses].pluck(:id)

      input[:ids_for_removing] = existing_ids - current_ids
      input[:ids_for_creating] = current_ids - existing_ids
    end

    def do_persist(input)
      input[:bonuses].each do |item|
        attributes = item[:type] == 'static' ? { value: item[:value] } : { dynamic_value: item[:value] }

        if input[:ids_for_creating].include?(item[:id])
          Character::Bonus.create(attributes.merge(bonusable: input[:bonusable]))
        else
          bonus = Character::Bonus.find_by(id: item[:id])
          bonus.update(attributes)
        end
      end

      input[:bonusable].bonuses.where(id: input[:ids_for_removing]).delete_all

      { result: :ok }
    end
  end
end
