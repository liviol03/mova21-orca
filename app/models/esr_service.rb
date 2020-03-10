# frozen_string_literal: true

class EsrService
  def generate(invoice)
    append_checksum format('%<unit_id>011d%<invoice_id>015d', unit_id: invoice.unit_id,
                                                              invoice_id: invoice.id)
  end

  def checksum(ref)
    check_table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
    (10 - ref.to_s.scan(/\d/).inject(0) { |carry, digit| check_table[(digit.to_i + carry) % check_table.size] }) % 10
  end

  def append_checksum(ref)
    ref.to_s + checksum(ref).to_s
  end

  def format_ref(ref)
    return '' if ref.blank?

    ref.reverse.chars.in_groups_of(5).reverse.map { |group| group.reverse.join }.join(' ')
  end
end
